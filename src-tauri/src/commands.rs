use std::sync::Arc;

use octocrab::models;
use tauri::{AppHandle, Runtime};

use crate::{
   log,
   new_github_api::GithubAPI,
   project::{
      task::{DraftTask, NewDraftTaskPayload, NewTaskPayload, Task},
      Project, ProjectPayload,
   },
   utils::{dbg_store, get_store, get_token},
};

#[tauri::command]
pub async fn fetch_save_and_return_user<R: Runtime>(app: AppHandle<R>) -> crate::Result<models::Author> {
   const F: &str = "[fetch_save_and_return_user]";

   let store = get_store(app)?;
   let token = get_token(&store)?;
   let user = GithubAPI::get_user(&token).await?;
   log!("{F} setting user: {}", user.login);
   let user_val = serde_json::to_value(&user).map_err(|e| e.to_string())?;
   dbg_store(&store);
   store.set("user", user_val);
   dbg_store(&store);
   log!("{F} returning user");
   Ok(user)
}

#[tauri::command]
pub async fn find_users_matching_query<R: Runtime>(
   app: AppHandle<R>,
   query: String,
) -> crate::Result<Vec<models::Author>> {
   let store = get_store(app)?;
   let token = get_token(&store)?;
   let users_found = GithubAPI::search_users(&query, &token).await?;
   Ok(users_found)
}

#[tauri::command]
pub async fn create_project<R: Runtime>(app: tauri::AppHandle<R>, payload: ProjectPayload) -> crate::Result<Project> {
   const F: &str = "[create_project]";

   log!("{F} {payload:#?}");
   let store = get_store(app)?;
   let project = Project::create_and_save(payload, store).await?;

   Ok(project)
}

#[tauri::command]
pub async fn sync_projects_with_github<R: Runtime>(app: tauri::AppHandle<R>) -> crate::Result {
   const F: &str = "[sync_projects_with_github]";

   let store = get_store(app)?;
   let token = get_token(&store)?;

   // get repos from github
   let repos = GithubAPI::get_repos(&token, None).await?;

   // save them to store with project-name = repo-name
   // (making sure to fecth the repo's issues if it has any, and converting them to tasks)
   log!("{F} converting repos to projects (with tasks if any) and saving to store");
   for repo in repos {
      // first determine if repo already has project in store
      let repo_already_has_project_in_store = if let Some(repo_ids) = store.get("repo-ids") {
         let repo_ids =
            serde_json::from_value::<Vec<String>>(repo_ids).map_err(|e| format!("{F} could not read repo-ids: {e}"))?;
         repo_ids.contains(&repo.id.to_string())
      } else {
         false
      };

      if repo_already_has_project_in_store {
         log!(
            "{F} repo '{}' with id '{}' already has a project in store, skipping it!",
            repo.name,
            repo.id
         );
         continue;
      }

      let team = GithubAPI::get_repo_collaborators(&repo, &token).await?;

      let pending_invites = GithubAPI::get_repo_collab_invitees(&repo, &token).await?;

      let tasks = if repo.has_issues.unwrap_or(false) {
         let issues = GithubAPI::get_repo_issues(&repo, &token).await?;
         let tasks = issues.into_iter().map(|issue| Task::from_issue(issue)).collect();
         Some(tasks)
      } else {
         None
      };

      let project = Project::new(repo.name.clone(), false, team, pending_invites, repo, tasks, None);

      project.place_in_store(Arc::clone(&store))?;
   }

   Ok(())
}

#[tauri::command]
pub async fn sync_project_with_github<R: Runtime>(app: tauri::AppHandle<R>, project_id: String) -> crate::Result {
   const F: &str = "[sync_project_with_github]";

   let store = get_store(app)?;
   let token = get_token(&store)?;

   let mut project = match store.get(&project_id) {
      Some(val) => serde_json::from_value::<Project>(val).map_err(|e| format!("{F} could not read project: {e}"))?,
      None => return Err(format!("{F} project with id '{project_id}' does not exist locally.")),
   };

   // fetch project's updated repo, team, pending_invotes and issues if it has any (converting them to tasks)
   log!(
      "{F} fetching project's updated repo, team, pending_invotes and issues if it has any (converting them to tasks)"
   );

   let updated_repo: models::Repository = GithubAPI::get_updated_repo(&project.get_repo(), &token).await?;

   let updated_team = GithubAPI::get_repo_collaborators(&updated_repo, &token).await?;

   let updated_pending_invites = GithubAPI::get_repo_collab_invitees(&updated_repo, &token).await?;

   let updated_tasks = if updated_repo.has_issues.unwrap_or(false) {
      let updated_issues = GithubAPI::get_repo_issues(&updated_repo, &token).await?;
      let updated_tasks = updated_issues
         .into_iter()
         .map(|issue| Task::from_issue(issue))
         .collect();
      Some(updated_tasks)
   } else {
      None
   };

   project.update(updated_team, updated_pending_invites, updated_repo, updated_tasks);

   // save updated project to store
   project.save_updates_to_store(Arc::clone(&store))?;

   Ok(())
}

#[tauri::command]
pub async fn create_task<R: Runtime>(app: tauri::AppHandle<R>, payload: NewTaskPayload) -> crate::Result<Task> {
   const F: &str = "[create_task]";

   log!("{F} {payload:#?}");
   let project_id = &payload.project_id;
   let store = get_store(app)?;
   let token = get_token(&store)?;

   let project = store
      .get(project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;
   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id {}: {e}", payload.project_id))?;

   let task = project
      .create_and_save_task(&token, payload, Arc::clone(&store))
      .await?;

   Ok(task)
}

#[tauri::command]
pub async fn create_backlog_task<R: Runtime>(app: tauri::AppHandle<R>, payload: NewTaskPayload) -> crate::Result<Task> {
   const F: &str = "[create_backlog_task]";

   log!("{F} {payload:#?}");
   let project_id = &payload.project_id;
   let store = get_store(app)?;
   let token = get_token(&store)?;

   let project = store
      .get(project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;
   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id {}: {e}", payload.project_id))?;

   let task = project
      .create_and_save_backlog_task(&token, payload, Arc::clone(&store))
      .await?;

   Ok(task)
}

#[tauri::command]
pub async fn assign_task_now<R: Runtime>(
   app: tauri::AppHandle<R>,
   task_id: String,
   project_id: String,
) -> crate::Result<Task> {
   const F: &str = "[assign_task_now]";

   log!("{F} assigning task with id {task_id} in project {project_id}");
   let store = get_store(app)?;
   let token = get_token(&store)?;

   let project = store
      .get(&project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;

   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id {project_id}: {e}"))?;

   let updated_task = project
      .assign_task_now(task_id, &token, &project.get_repo().clone(), store)
      .await?;
   log!("{F} done assigning task!");

   Ok(updated_task)
}

#[tauri::command]
pub async fn delete_task<R: Runtime>(
   app: tauri::AppHandle<R>,
   task_id: String,
   project_id: String,
) -> crate::Result<String> {
   const F: &str = "[delete_task]";

   log!("{F} deleting task with id {task_id} in project {project_id}");
   let store = get_store(app)?;
   let token = get_token(&store)?;

   let project = store
      .get(&project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;

   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id {project_id}: {e}"))?;

   project
      .delete_task(&task_id, &token, &project.get_repo().clone(), store)
      .await?;
   log!("{F} done deleting task!");

   Ok(task_id)
}

#[tauri::command]
pub async fn create_draft_task<R: Runtime>(
   app: tauri::AppHandle<R>,
   payload: NewDraftTaskPayload,
) -> crate::Result<DraftTask> {
   const F: &str = "[create_draft_task]";

   log!("{F} {payload:#?}");
   let project_id = &payload.project_id;
   let store = get_store(app)?;
   let project = store
      .get(project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;
   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id {}: {e}", payload.project_id))?;

   let task = project.create_and_save_draft_task(payload, Arc::clone(&store)).await?;

   Ok(task)
}

use std::sync::Arc;

use futures_util::future::join_all;
use octocrab::models::{self, repos::RepoCommit};
use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, Runtime};

use crate::{
   log,
   new_github_api::GithubAPI,
   project::{
      task::{DraftTask, NewDraftTaskPayload, NewTaskPayload, Task},
      Project, ProjectPatchArgs, ProjectPayload,
   },
   utils::{dbg_store, get_store, get_token, IssueExt},
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
         let tasks = Project::map_issues_to_tasks_with_review_status(issues, &token).await?;
         Some(tasks)
      } else {
         None
      };

      let project = Project::new(repo.name.clone(), false, team, pending_invites, repo, tasks, None, None);

      project.place_in_store(Arc::clone(&store))?;
   }

   Ok(())
}

#[derive(Debug, Serialize, Clone)]
pub struct ProjectSyncResult {
   was_successfull: bool,
   message: String,
}

impl ProjectSyncResult {
   pub fn new(was_successfull: bool, message: String) -> Self {
      Self {
         was_successfull,
         message,
      }
   }
}

#[tauri::command]
pub async fn sync_projects_with_github_v2<R: Runtime>(app: tauri::AppHandle<R>) -> crate::Result {
   const F: &str = "[sync_projects_with_github]";

   let main_window = app.get_webview_window("main");
   let store = get_store(app)?;
   let token = get_token(&store)?;

   // get repos from github
   let repos = GithubAPI::get_repos(&token, None).await?;

   // save them to store with project-name = repo-name
   // (making sure to fetch the repo's issues if it has any, and converting them to tasks)
   log!("{F} converting repos to projects (with tasks if any) and saving to store");
   let mut sync_result_futures = vec![];

   let repo_ids = if let Some(repo_ids) = store.get("repo-ids") {
      serde_json::from_value::<Vec<String>>(repo_ids).map_err(|e| format!("{F} could not read repo-ids: {e}"))?
   } else {
      vec![]
   };

   for repo in repos {
      // first determine if repo already has project in store
      if repo_ids.contains(&repo.id.to_string()) {
         log!(
            "{F} repo '{}' with id '{}' already has a project in store, skipping it!",
            repo.name,
            repo.id
         );
         continue;
      }

      let sync_fut = async {
         let team = GithubAPI::get_repo_collaborators(&repo, &token).await?;

         let pending_invites = GithubAPI::get_repo_collab_invitees(&repo, &token).await?;

         let tasks = if repo.has_issues.unwrap_or(false) {
            let issues = GithubAPI::get_repo_issues(&repo, &token).await?;
            let tasks = Project::map_issues_to_tasks_with_review_status(issues, &token).await?;
            Some(tasks)
         } else {
            None
         };

         Ok(Project::new(
            repo.name.clone(),
            false,
            team,
            pending_invites,
            repo,
            tasks,
            None,
            None,
         ))
      };

      sync_result_futures.push(sync_fut);
   }

   let project_results: Vec<Result<Project, String>> = join_all(sync_result_futures).await;
   for (num, project_result) in project_results.into_iter().enumerate() {
      let sync_message = match project_result {
         Ok(project) => {
            project.place_in_store(Arc::clone(&store))?;
            let msg = format!("Successfully pulled and created project for '{}'", project.name());
            log!("{F} {msg}");
            ProjectSyncResult::new(true, msg)
         }
         Err(e) => {
            let msg = format!("Failed to pull repo and create project (#{num}). {e}");
            log!("{F} {msg}");
            ProjectSyncResult::new(true, msg)
         }
      };

      // emit error
      if let Some(main_window) = &main_window {
         if let Err(e) = main_window.emit("project_sync_result", sync_message) {
            log!("{F} failed to emit sync message {e}");
         }
      };
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
      let mut updated_tasks = Project::map_issues_to_tasks_with_review_status(updated_issues, &token).await?;

      for task in updated_tasks.iter_mut() {
         let branch_name = task.get_inner_issue().task_branch_name();
         let updated_commits = GithubAPI::get_branch_commits(&updated_repo, branch_name, &token)
            .await
            .ok();
         task.update(None, None, None, None, updated_commits);
      }

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

#[derive(Serialize, Debug)]
pub struct DraftTaskAssignmentResponse {
   task: Task,
   old_draft_id: String,
}

#[tauri::command]
pub async fn assign_draft_task_now<R: Runtime>(
   app: tauri::AppHandle<R>,
   draft_id: String,
   project_id: String,
) -> crate::Result<DraftTaskAssignmentResponse> {
   const F: &str = "[assign_task_now]";

   log!("{F} assigning drafted task with id {draft_id} in project {project_id}");
   let store = get_store(app)?;
   let token = get_token(&store)?;

   let project = store
      .get(&project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;

   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id {project_id}: {e}"))?;

   let derived_task = project
      .assign_drafted_task_now(draft_id.clone(), &token, &project.get_repo().clone(), store)
      .await?;
   log!("{F} done assigning drafted task!");

   Ok(DraftTaskAssignmentResponse {
      task: derived_task,
      old_draft_id: draft_id,
   })
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
pub async fn edit_task<R: Runtime>(
   app: tauri::AppHandle<R>,
   payload: NewTaskPayload,
   task_id: String,
) -> crate::Result<Task> {
   const F: &str = "[edit_task]";

   let project_id = &payload.project_id;
   log!("{F} editing task with id {task_id} in project {project_id}");
   let store = get_store(app)?;
   let token = get_token(&store)?;

   let project = store
      .get(project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;

   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id {project_id}: {e}"))?;

   let updated_task = project
      .edit_task(&task_id, payload, &token, &project.get_repo().clone(), store)
      .await?;
   log!("{F} done editing task!");

   Ok(updated_task)
}

#[tauri::command]
pub async fn edit_draft_task<R: Runtime>(
   app: tauri::AppHandle<R>,
   payload: NewDraftTaskPayload,
   draft_id: String,
) -> crate::Result<DraftTask> {
   const F: &str = "[edit_draft_task]";

   let project_id = &payload.project_id;
   log!("{F} editing draft task with id {draft_id} in project {project_id}");
   let store = get_store(app)?;

   let project = store
      .get(project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;

   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id {project_id}: {e}"))?;

   let updated_draft_task = project.edit_draft_task(&draft_id, payload, store).await?;
   log!("{F} done editing draft task!");

   Ok(updated_draft_task)
}

#[tauri::command]
pub async fn delete_draft_task<R: Runtime>(
   app: tauri::AppHandle<R>,
   draft_id: String,
   project_id: String,
) -> crate::Result<String> {
   const F: &str = "[delete_draft_task]";

   log!("{F} deleting draft task with id {draft_id} in project {project_id}");
   let store = get_store(app)?;

   let project = store
      .get(&project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;

   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id {project_id}: {e}"))?;

   project.delete_draft_task(&draft_id, store).await?;
   log!("{F} done deleting draft task!");

   Ok(draft_id)
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

#[derive(Serialize, Debug)]
pub struct ActivitySyncResponse {
   commits: Vec<RepoCommit>,
   task_id: String,
}

#[tauri::command]
pub async fn sync_task_activity<R: Runtime>(
   app: tauri::AppHandle<R>,
   task_id: String,
   project_id: String,
) -> crate::Result<ActivitySyncResponse> {
   const F: &str = "[sync_task_activity]";

   log!("{F} syncing task activity for task with id '{task_id}");
   let store = get_store(app)?;
   let token = get_token(&store)?;

   let project = store
      .get(&project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;
   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id '{project_id}': {e}",))?;

   let synced_activity = project
      .sync_activity_for_task_v2(task_id.clone(), &token, Arc::clone(&store))
      .await?;

   log!("{F} now returning synced task activity");

   Ok(ActivitySyncResponse {
      commits: synced_activity,
      task_id,
   })
}

#[tauri::command]
pub async fn delete_project_permanently<R: Runtime>(app: tauri::AppHandle<R>, project_id: String) -> crate::Result {
   const F: &str = "[delete_project_permanently]";

   log!("{F} deleting project with id '{project_id}' permanently");
   let store = get_store(app)?;
   let token = get_token(&Arc::clone(&store))?;

   let project = store
      .get(&project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;

   let project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id '{project_id}': {e}",))?;

   project.delete_permanently(&token, store).await?;
   log!("{F} successfully deleted project with id '{project_id}' permanently");
   Ok(())
}

#[tauri::command]
pub async fn delete_project_locally<R: Runtime>(app: tauri::AppHandle<R>, project_id: String) -> crate::Result {
   const F: &str = "[delete_project_locally]";

   log!("{F} deleting project with id '{project_id}' from local store");
   let store = get_store(app)?;

   let project = store
      .get(&project_id)
      .ok_or(format!("{F} project with id {project_id} not found"))?;

   let project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id '{project_id}': {e}",))?;

   project.delete_locally(store)?;
   log!("{F} successfully deleted project with id '{project_id}' from local store");
   Ok(())
}

#[tauri::command]
pub async fn update_project_team<R: Runtime>(app: tauri::AppHandle<R>, patch_args: ProjectPatchArgs) -> crate::Result {
   const F: &str = "[update_project_team]";

   log!("{F} updating team for project with id '{}'", patch_args.project_id);
   let store = get_store(app)?;

   let project = store
      .get(&patch_args.project_id)
      .ok_or(format!("{F} project with id {} not found", patch_args.project_id))?;

   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id '{}': {e}", patch_args.project_id))?;

   if let Some(updated_team_logins) = patch_args.settings_patch.team {
      project.update_and_save_team(updated_team_logins, store).await?;
      log!("{F} team updated for project '{}'", patch_args.project_id);
   } else {
      log!("{F} no team updates were made for project '{}'", patch_args.project_id);
   }

   Ok(())
}

#[tauri::command]
pub async fn update_general_project_metadata<R: Runtime>(
   app: tauri::AppHandle<R>,
   patch_args: ProjectPatchArgs,
) -> crate::Result<Project> {
   const F: &str = "[update_general_project_metadata]";

   log!(
      "{F} updating general metadata for project with id '{}'",
      patch_args.project_id
   );
   let store = get_store(app)?;
   let token = get_token(&store)?;

   let project = store
      .get(&patch_args.project_id)
      .ok_or(format!("{F} project with id {} not found", patch_args.project_id))?;

   let mut project = serde_json::from_value::<Project>(project)
      .map_err(|e| format!("{F} failed to read project with id '{}': {e}", patch_args.project_id))?;

   // update name if different
   if let Some(new_project_name) = &patch_args.settings_patch.name {
      if new_project_name != project.name() {
         project.partial_update(
            Some(new_project_name.to_string()),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
         );
         project.save_updates_to_store(Arc::clone(&store))?;
      }
   };

   // update repo name and visibility if different
   let new_repo_name = if patch_args
      .settings_patch
      .repo_name
      .clone()
      .is_some_and(|n| n != project.repo().name)
   {
      patch_args.settings_patch.repo_name
   } else {
      None
   };

   let new_repo_is_private = if patch_args
      .settings_patch
      .repo_is_private
      .is_some_and(|is_prvt| Some(is_prvt) != project.repo().private)
   {
      patch_args.settings_patch.repo_is_private
   } else {
      None
   };

   if new_repo_name.is_some() || new_repo_is_private.is_some() {
      project
         .update_repo(new_repo_name, new_repo_is_private, store, &token)
         .await?;
   }

   Ok(project)
}

use std::sync::Arc;

use octocrab::models;
use tauri::{AppHandle, Runtime};

use crate::{
   log,
   new_github_api::GithubAPI,
   project::{Project, ProjectPayload},
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
   log!("{F} converting repos to projects and saving to store");
   for repo in repos {
      let team = GithubAPI::get_repo_collaborators(&repo).await?;
      let pending_invites = GithubAPI::get_repo_collab_invitees(&repo).await?;
      let project = Project::new(repo.name.clone(), false, team, pending_invites, repo);
      project.save_to_store(Arc::clone(&store))?;
   }

   Ok(())
}

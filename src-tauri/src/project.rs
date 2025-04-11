use std::sync::Arc;

use octocrab::models;
use serde::{Deserialize, Serialize};
use tauri::Runtime;
use tauri_plugin_store::Store;

use crate::{
   log,
   new_github_api::{GithubAPI, RepoPayload},
   utils::get_token,
   TEAM_LOGINS_SEPERATOR,
};

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectPayload {
   name: String,
   repo_name: String,
   team: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Project {
   id: String,
   name: String,
   locally_created: bool,
   creation_timestamp: i64,
   team: Vec<models::Author>,
   pending_invites: Vec<models::Author>,
   repo: models::Repository,
}

impl Project {
   pub fn new(
      name: impl Into<String>,
      locally_created: bool,
      team: Vec<models::Author>,
      pending_invites: Vec<models::Author>,
      repo: models::Repository,
   ) -> Self {
      let creation_timestamp = chrono::Utc::now().timestamp_millis();
      let name = name.into();
      let id = format!("{name}-{creation_timestamp}",);

      Self {
         id,
         name,
         locally_created,
         creation_timestamp,
         team,
         pending_invites,
         repo,
      }
   }

   pub async fn create_and_save(payload: ProjectPayload, store: Arc<Store<impl Runtime>>) -> crate::Result<Self> {
      const F: &str = "[create_and_save]";
      let token = get_token(&store)?;

      // step 1: Create the Repository
      let repo_payload = RepoPayload::new(payload.repo_name.clone());
      let repo = GithubAPI::create_repo(repo_payload, &token).await?;
      log!("{F} step 1 complete! repo created: {}", repo.name);

      // step 2: Add Collaborators
      let team_logins = payload.team.split(TEAM_LOGINS_SEPERATOR).collect::<Vec<_>>();
      log!("{F} team-logins = {team_logins:#?}");
      let mut pending_invites: Vec<models::Author> = vec![];
      for login in team_logins {
         let owner = repo.owner.clone().ok_or(format!(
            "{F} repo '{}' somehow does not have an owner set up",
            repo.name
         ))?;
         let collaborator_invited = GithubAPI::invite_collaborator(login, &token, &owner.login, &repo.name).await?;
         pending_invites.push(collaborator_invited);
         log!("{F} successfully invited {login}!");
      }

      // skip for now, use alternate non-project oriented architecture
      {
         // step 3: Create GitHub Project Skip

         // step 4: Add Project Columns

         // step 5: Set Up Automation

         // step 6: create branch conventions (to link with task tracking)
      }

      // final step : save project to store and return
      let project = Self::new(payload.name, true, vec![], pending_invites, repo);
      project.save_to_store(store)?;
      log!("{F} final step complete! project saved to store. Now returning project: project");

      Ok(project)
   }

   pub fn save_to_store(&self, store: Arc<Store<impl Runtime>>) -> crate::Result {
      const F: &str = "[save]";
      let value = serde_json::to_value(self).map_err(|e| format!("{F} {}", e.to_string()))?;
      let id = self.id.clone();
      store.set(&id, value);

      if let Some(project_ids) = store.get("project-ids") {
         let mut project_ids = serde_json::from_value::<Vec<String>>(project_ids)
            .map_err(|e| format!("{F} could not deserialize project-ids: {e}"))?;

         if project_ids.contains(&id) {
            return Err(format!("{F} project with id '{id}' already exists in local store"));
         } else {
            project_ids.push(id);
            store.set("project-ids", project_ids);
         }
      } else {
         store.set("project-ids", vec![id]);
      }

      Ok(())
   }
}

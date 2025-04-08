use std::sync::Arc;

use octocrab::models;
use serde::{Deserialize, Serialize};
use tauri::Runtime;
use tauri_plugin_store::Store;

use crate::{
   github_api::{self, RepoPayload},
   log,
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
   name: String,
   repo: models::Repository,
}

impl Project {
   pub async fn create_and_save(payload: ProjectPayload, store: Arc<Store<impl Runtime>>) -> crate::Result<Self> {
      const F: &str = "[create_and_save]";
      let token = get_token(&store)?.get_token();

      // step 1: Create the Repository
      let repo_payload = RepoPayload::new(payload.repo_name.clone());
      let repo = github_api::create_repo(repo_payload, &token).await?;
      log!("{F} step 1 complete! repo created: {repo:#?}");

      // step 2: Add Collaborators
      let team_logins = payload.team.split(TEAM_LOGINS_SEPERATOR).collect::<Vec<_>>();
      log!("{F} team-logins = {team_logins:#?}");
      for login in team_logins {
         let owner = repo.owner.clone().ok_or(format!(
            "{F} repo '{}' somehow does not have an owner set up",
            repo.name
         ))?;
         github_api::invite_collaborator(login, &token, &owner.login, &repo.name).await?;
         log!("{F} successfully invited {login}!");
      }

      // step 3: Create GitHub Project

      // step 4: Add Project Columns

      // step 5: Set Up Automation

      // step 6: create branch conventions (to link with task tracking)

      // final step : save project to store and return
      let project = Self {
         name: payload.name,
         repo,
      };
      project.save_to_store(store)?;
      log!("{F} final step complete! project saved to store. Now returning project: project");

      Ok(project)
   }

   pub fn save_to_store(&self, store: Arc<Store<impl Runtime>>) -> crate::Result {
      const F: &str = "[save]";
      let value = serde_json::to_value(self).map_err(|e| format!("{F} {}", e.to_string()))?;
      store.set(self.name.clone(), value);
      Ok(())
   }
}

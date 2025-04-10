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
   name: String,
   repo: models::Repository,
}

impl Project {
   pub fn new(name: impl Into<String>, repo: models::Repository) -> Self {
      Self {
         name: name.into(),
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
      for login in team_logins {
         let owner = repo.owner.clone().ok_or(format!(
            "{F} repo '{}' somehow does not have an owner set up",
            repo.name
         ))?;
         GithubAPI::invite_collaborator(login, &token, &owner.login, &repo.name).await?;
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
      let name = self.name.clone();
      store.set(&name, value);

      if let Some(project_names) = store.get("project-names") {
         let mut project_names = serde_json::from_value::<Vec<String>>(project_names)
            .map_err(|e| format!("{F} could not deserialize project-names: {e}"))?;

         if project_names.contains(&name) {
            return Err(format!("{F} project with name '{name}' already exists in local store"));
         } else {
            project_names.push(name);
            store.set("project-names", project_names);
         }
      } else {
         store.set("project-names", vec![name]);
      }

      Ok(())
   }
}

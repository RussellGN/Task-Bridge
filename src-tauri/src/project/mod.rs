pub mod task;

use std::sync::Arc;

use octocrab::models;
use serde::{Deserialize, Serialize};
use task::{DraftTask, NewDraftTaskPayload, NewTaskPayload, Task};
use tauri::Runtime;
use tauri_plugin_store::Store;

use crate::{
   auth::AccessToken,
   log,
   new_github_api::{GithubAPI, RepoPayload},
   utils::get_token,
   TEAM_LOGINS_SEPERATOR,
};

#[derive(Deserialize, Debug)]
pub struct ProjectPayload {
   name: String,
   repo_name: String,
   team: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Project {
   id: String,
   name: String,
   locally_created: bool,
   creation_timestamp: i64,
   team: Vec<models::Author>,
   pending_invites: Vec<models::Author>,
   repo: models::Repository,
   repo_id: String,
   tasks: Option<Vec<Task>>,
   draft_tasks: Option<Vec<DraftTask>>,
}

impl Project {
   pub fn new(
      name: impl Into<String>,
      locally_created: bool,
      team: Vec<models::Author>,
      pending_invites: Vec<models::Author>,
      repo: models::Repository,
      tasks: Option<Vec<Task>>,
      draft_tasks: Option<Vec<DraftTask>>,
   ) -> Self {
      let creation_timestamp = chrono::Utc::now().timestamp_millis();
      let name = name.into();
      let id = format!("{name}-{creation_timestamp}",);
      let repo_id = repo.id.to_string();

      Self {
         id,
         name,
         locally_created,
         creation_timestamp,
         team,
         pending_invites,
         repo,
         repo_id,
         tasks,
         draft_tasks,
      }
   }

   pub fn update(
      &mut self,
      team: Vec<models::Author>,
      pending_invites: Vec<models::Author>,
      repo: models::Repository,
      tasks: Option<Vec<Task>>,
   ) {
      self.team = team;
      self.pending_invites = pending_invites;
      self.repo = repo;
      self.tasks = tasks;
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
         if login.trim().is_empty() {
            continue;
         }
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
      let project = Self::new(payload.name, true, vec![], pending_invites, repo, None, None);
      project.place_in_store(store)?;
      log!("{F} final step complete! project saved to store. Now returning project: project");

      Ok(project)
   }

   pub fn place_in_store(&self, store: Arc<Store<impl Runtime>>) -> crate::Result {
      const F: &str = "[save_to_store]";
      let value = serde_json::to_value(self).map_err(|e| format!("{F} {}", e.to_string()))?;
      let project_id = self.id.clone();
      store.set(&project_id, value);

      // save project-ids in standalone vec
      if let Some(project_ids) = store.get("project-ids") {
         let mut project_ids = serde_json::from_value::<Vec<String>>(project_ids)
            .map_err(|e| format!("{F} could not deserialize project-ids: {e}"))?;

         if project_ids.contains(&project_id) {
            return Err(format!(
               "{F} project with id '{project_id}' already exists in local store"
            ));
         } else {
            project_ids.push(project_id);
            store.set("project-ids", project_ids);
         }
      } else {
         store.set("project-ids", vec![project_id]);
      }

      // save repo-ids in standalone vec
      let repo_id = self.repo_id.clone();
      if let Some(repo_ids) = store.get("repo-ids") {
         let mut repo_ids = serde_json::from_value::<Vec<String>>(repo_ids)
            .map_err(|e| format!("{F} could not deserialize repo-ids: {e}"))?;

         if repo_ids.contains(&repo_id) {
            return Err(format!(
               "{F} repo with id '{repo_id}' already has a project set-up and already exists in local store"
            ));
         } else {
            repo_ids.push(repo_id);
            store.set("repo-ids", repo_ids);
         }
      } else {
         store.set("repo-ids", vec![repo_id]);
      }

      Ok(())
   }

   pub fn save_updates_to_store(&self, store: Arc<Store<impl Runtime>>) -> crate::Result {
      const F: &str = "[save_updates_to_store]";
      let value = serde_json::to_value(self).map_err(|e| format!("{F} {}", e.to_string()))?;
      store.set(&self.id, value);
      Ok(())
   }

   pub fn get_repo(&self) -> &models::Repository {
      &self.repo
   }

   pub async fn create_and_save_task(&self, token: &AccessToken, payload: NewTaskPayload) -> crate::Result<Task> {
      let issue = GithubAPI::create_issue(&self.repo, token, payload).await?;
      let task = Task::from_issue(issue);
      Ok(task)
   }

   pub async fn create_and_save_draft_task(
      &mut self,
      payload: NewDraftTaskPayload,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result<DraftTask> {
      let assignee = if let Some(login) = payload.assignee_login {
         self.team.iter().find(|m| m.login == login).map(|m| m.to_owned())
      } else {
         None
      };
      let draft_task = DraftTask::new(payload.title, payload.body, assignee, payload.priority);

      if let Some(drafts) = &mut self.draft_tasks {
         drafts.push(draft_task.clone());
      } else {
         self.draft_tasks = Some(vec![draft_task.clone()])
      }

      self.save_updates_to_store(store)?;

      Ok(draft_task)
   }
}

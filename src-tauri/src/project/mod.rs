pub mod task;

use std::sync::Arc;

use futures_util::future::join_all;
use octocrab::models;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use task::{DraftTask, NewDraftTaskPayload, NewTaskPayload, Task};
use tauri::{http::Method, Runtime};
use tauri_plugin_store::Store;

use crate::{
   auth::AccessToken,
   error::AppError,
   log,
   new_github_api::{GithubAPI, RepoPayload},
   utils::{get_token, IssueExt},
   TEAM_LOGINS_SEPERATOR,
};

#[derive(Deserialize, Debug)]
pub struct ProjectPayload {
   name: String,
   repo_name: String,
   team: String,
   repo_is_private: bool,
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
   project_sync_interval_mins: Option<i32>,
}

#[allow(unused)]
#[derive(Deserialize, Debug, Clone)]
pub struct ProjectSettingsPatchPayload {
   // name & visibility settings
   pub name: Option<String>,
   pub repo_name: Option<String>,
   pub repo_is_private: Option<bool>,
   // team settings
   pub team: Option<String>,
   // sync settings
   pub project_sync_interval_mins: Option<i32>,
   // delete options
   pub locally_delete_project: Option<String>,
   pub permanent_delete_project: Option<String>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct ProjectPatchArgs {
   pub project_id: String,
   pub settings_patch: ProjectSettingsPatchPayload,
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
      project_sync_interval_mins: Option<i32>,
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
         project_sync_interval_mins,
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

   pub fn partial_update(
      &mut self,
      upd_name: Option<String>,
      upd_locally_created: Option<bool>,
      upd_team: Option<Vec<models::Author>>,
      upd_pending_invites: Option<Vec<models::Author>>,
      upd_repo: Option<models::Repository>,
      upd_repo_id: Option<String>,
      upd_tasks: Option<Option<Vec<Task>>>,
      upd_draft_tasks: Option<Option<Vec<DraftTask>>>,
      upd_project_sync_interval_mins: Option<Option<i32>>,
   ) {
      if let Some(upd_name) = upd_name {
         self.name = upd_name
      }
      if let Some(upd_locally_created) = upd_locally_created {
         self.locally_created = upd_locally_created
      }
      if let Some(upd_team) = upd_team {
         self.team = upd_team
      }
      if let Some(upd_pending_invites) = upd_pending_invites {
         self.pending_invites = upd_pending_invites
      }
      if let Some(upd_repo) = upd_repo {
         self.repo = upd_repo
      }
      if let Some(upd_repo_id) = upd_repo_id {
         self.repo_id = upd_repo_id
      }
      if let Some(upd_tasks) = upd_tasks {
         self.tasks = upd_tasks
      }
      if let Some(upd_draft_tasks) = upd_draft_tasks {
         self.draft_tasks = upd_draft_tasks
      }
      if let Some(upd_project_sync_interval_mins) = upd_project_sync_interval_mins {
         self.project_sync_interval_mins = upd_project_sync_interval_mins
      }
   }

   pub async fn create_and_save(payload: ProjectPayload, store: Arc<Store<impl Runtime>>) -> crate::Result<Self> {
      const F: &str = "[create_and_save]";
      let token = get_token(&store)?;

      // step 1: Create the Repository
      let repo_payload = RepoPayload::new(Some(payload.repo_name.clone()), Some(payload.repo_is_private));
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
         let owner = repo.owner.clone().ok_or(AppError::unknown(
            &format!("repo '{}' somehow does not have an owner set up", repo.name),
            F,
            None,
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
      let project = Self::new(payload.name, true, vec![], pending_invites, repo, None, None, None);
      project.place_in_store(store)?;
      log!("{F} final step complete! project saved to store. Now returning project: project");

      Ok(project)
   }

   pub async fn update_and_save_team(&mut self, team_logins: String, store: Arc<Store<impl Runtime>>) -> crate::Result {
      const F: &str = "[Project::update_and_save_team]";
      let token = get_token(&store)?;

      let new_team_logins = team_logins.split(TEAM_LOGINS_SEPERATOR).collect::<Vec<_>>();
      log!("{F} team-logins = {new_team_logins:#?}");

      let owner = self.repo.owner.clone().ok_or(AppError::unknown(
         &format!("repo '{}' somehow does not have an owner set up", self.repo.name),
         F,
         None,
      ))?;

      // invite new collaborators
      for login in new_team_logins.clone() {
         let is_part_of_team = self.team.iter().find(|a| a.login == login).is_some();
         let is_pending = self.pending_invites.iter().find(|a| a.login == login).is_some();
         if login.trim().is_empty() || is_part_of_team || is_pending {
            continue;
         }

         let collaborator_invited =
            GithubAPI::invite_collaborator(login, &token, &owner.login, &self.repo.name).await?;
         self.pending_invites.push(collaborator_invited);
         log!("{F} successfully invited {login} to team!");
      }

      // remove removed collaborators
      for login in self.team.iter().map(|a| a.login.clone()).collect::<Vec<String>>() {
         let is_part_of_new_team = new_team_logins.contains(&login.as_str());
         if login.trim().is_empty() || is_part_of_new_team {
            continue;
         }

         GithubAPI::remove_collaborator(&login, &token, &owner.login, &self.repo).await?;

         self.team = self
            .team
            .clone()
            .into_iter()
            .filter(|a| a.login.to_string() != login.to_string())
            .collect();
         log!("{F} successfully removed {login} from team!");
      }

      // cancel pending invites to removed collaborators
      for login in self.pending_invites.iter().map(|a| a.login.clone()).collect::<Vec<_>>() {
         let is_part_of_new_team = new_team_logins.contains(&login.as_str());
         if login.trim().is_empty() || is_part_of_new_team {
            continue;
         }

         GithubAPI::cancel_any_invite_to(&login, &token, &owner.login, &self.repo).await?;

         self.pending_invites = self
            .pending_invites
            .clone()
            .into_iter()
            .filter(|a| a.login.to_string() != login.to_string())
            .collect();
         log!("{F} cancelled collab invite sent to {login}!");
      }

      self.save_updates_to_store(store)
   }

   pub fn place_in_store(&self, store: Arc<Store<impl Runtime>>) -> crate::Result {
      const F: &str = "[save_to_store]";
      let value = serde_json::to_value(self).map_err(|e| AppError::unknown(&e.to_string(), F, None))?;
      let project_id = self.id.clone();
      store.set(&project_id, value);

      // save project-ids in standalone vec
      if let Some(project_ids) = store.get("project-ids") {
         let mut project_ids = serde_json::from_value::<Vec<String>>(project_ids)
            .map_err(|e| AppError::unknown(&format!("could not deserialize project-ids: {e}"), F, None))?;

         if project_ids.contains(&project_id) {
            return Err(AppError::unknown(
               "project with id '{project_id}' already exists in local store",
               F,
               None,
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
            .map_err(|e| AppError::unknown(&format!("could not deserialize repo-ids: {e}"), F, None))?;

         if repo_ids.contains(&repo_id) {
            return Err(AppError::unknown(
               &format!("repo with id '{repo_id}' already has a project set-up and already exists in local store"),
               F,
               None,
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
      let value = serde_json::to_value(self).map_err(|e| AppError::unknown(&e.to_string(), F, None))?;
      store.set(&self.id, value);
      Ok(())
   }

   pub fn get_repo(&self) -> &models::Repository {
      &self.repo
   }

   pub async fn create_and_save_task(
      &mut self,
      token: &AccessToken,
      payload: NewTaskPayload,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result<Task> {
      let issue = GithubAPI::create_issue(&self.repo, token, payload, None).await?;
      let task = Task::from_issue(issue);

      if let Some(tasks) = &mut self.tasks {
         tasks.push(task.clone());
      } else {
         self.tasks = Some(vec![task.clone()])
      }
      self.save_updates_to_store(store)?;

      Ok(task)
   }

   pub async fn create_and_save_backlog_task(
      &mut self,
      token: &AccessToken,
      payload: NewTaskPayload,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result<Task> {
      let labels = vec![String::from("backlog")];
      let issue = GithubAPI::create_issue(&self.repo, token, payload, Some(labels)).await?;
      let task = Task::from_issue(issue);

      if let Some(tasks) = &mut self.tasks {
         tasks.push(task.clone());
      } else {
         self.tasks = Some(vec![task.clone()])
      }
      self.save_updates_to_store(store)?;

      Ok(task)
   }

   pub async fn assign_task_now(
      &mut self,
      task_id: String,
      token: &AccessToken,
      repo: &models::Repository,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result<Task> {
      const F: &str = "[Project::assign_task_now]";

      let tasks = match &mut self.tasks {
         Some(tasks) => tasks,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no tasks", self.name),
               F,
               None,
            ))
         }
      };

      let task = match tasks.iter_mut().find(|t| t.get_inner_issue().id.to_string() == task_id) {
         Some(task) => task,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no task with id {task_id}", self.name),
               F,
               None,
            ))
         }
      };

      let updated_issue = GithubAPI::update_issue(
         task.get_inner_issue(),
         repo,
         token,
         None,
         None,
         None,
         Some(
            &task
               .get_inner_issue()
               .labels
               .iter()
               .filter_map(|label| {
                  let label = label.name.trim().to_lowercase();
                  if label != "backlog" {
                     Some(label)
                  } else {
                     None
                  }
               })
               .collect::<Vec<_>>(),
         ),
         None,
      )
      .await?;

      task.update(None, Some(false), None, Some(updated_issue), None);
      let updated_task = task.to_owned();
      self.save_updates_to_store(store)?;

      Ok(updated_task)
   }

   #[allow(unused)]
   pub async fn sync_activity_for_task(
      &mut self,
      task_id: String,
      token: &AccessToken,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result<Vec<models::repos::RepoCommit>> {
      const F: &str = "[Project::sync_activity_for_task]";

      let tasks = match &mut self.tasks {
         Some(tasks) => tasks,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no tasks", self.name),
               F,
               None,
            ))
         }
      };

      let task = match tasks.iter_mut().find(|t| t.get_inner_issue().id.to_string() == task_id) {
         Some(task) => task,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no task with id {task_id}", self.name),
               F,
               None,
            ))
         }
      };

      let branch_name = task.get_inner_issue().task_branch_name();
      let commits = GithubAPI::get_branch_commits(&self.repo, branch_name, token).await?;

      task.update(None, None, None, None, Some(commits.clone()));
      self.save_updates_to_store(store)?;

      Ok(commits)
   }

   pub async fn sync_activity_for_task_v2(
      &mut self,
      task_id: String,
      token: &AccessToken,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result<Vec<models::repos::RepoCommit>> {
      const F: &str = "[Project::sync_activity_for_task_v2]";

      let repo = self.repo.clone();
      let tasks = match &mut self.tasks {
         Some(tasks) => tasks,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no tasks", self.name),
               F,
               None,
            ))
         }
      };

      let task = match tasks.iter_mut().find(|t| t.get_inner_issue().id.to_string() == task_id) {
         Some(task) => task,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no task with id {task_id}", self.name),
               F,
               None,
            ))
         }
      };

      // 1. get branch names that end in '_<task number>'
      let branches = GithubAPI::get_branches(&repo, token).await?;
      let corresponding_branches = branches
         .into_iter()
         .filter(|b| task.is_corresponding_branch(&b.name))
         .collect::<Vec<_>>();

      // 2. fetch all commits unique to those branches and qualify them with their branch names
      let commits_futs = corresponding_branches
         .into_iter()
         .map(|b| GithubAPI::get_branch_commits(&self.repo, b.name, token))
         .collect::<Vec<_>>();

      let commits_fetch_results = join_all(commits_futs).await;
      let mut commits = vec![];

      for (i, commits_fetch_result) in commits_fetch_results.into_iter().enumerate() {
         match commits_fetch_result {
            Ok(mut cs) => commits.append(&mut cs),
            Err(e) => log!("{F} couldnt fetch commits for branch {i}: {e}"),
         }
      }

      // 3. set activity to these commits, update store, and return
      task.update(None, None, None, None, Some(commits.clone()));
      self.save_updates_to_store(store)?;

      Ok(commits)
   }

   pub async fn assign_drafted_task_now(
      &mut self,
      draft_id: String,
      token: &AccessToken,
      repo: &models::Repository,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result<Task> {
      const F: &str = "[Project::assign_drafted_task_now]";

      let draft_tasks = match &mut self.draft_tasks {
         Some(draft_tasks) => draft_tasks,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no draft-tasks", self.name),
               F,
               None,
            ))
         }
      };

      let draft_task = match draft_tasks.iter_mut().find(|t| t.get_id() == draft_id) {
         Some(draft_task) => draft_task,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no draft-task with id {draft_id}", self.name),
               F,
               None,
            ))
         }
      };

      let task_payload = NewTaskPayload::from_draft_task_and_project_id(draft_task.clone(), self.id.clone())?;
      let labels = vec![format!("{}-priority", task_payload.priority)];
      let derived_issue = GithubAPI::create_issue(repo, token, task_payload, Some(labels)).await?;

      let derived_task = Task::from_issue(derived_issue);
      self.delete_draft_task(&draft_id, Arc::clone(&store)).await?;

      if let Some(tasks) = &mut self.tasks {
         tasks.push(derived_task.clone());
      } else {
         self.tasks = Some(vec![derived_task.clone()]);
      }

      self.save_updates_to_store(store)?;

      Ok(derived_task)
   }

   pub async fn edit_task(
      &mut self,
      task_id: &str,
      payload: NewTaskPayload,
      token: &AccessToken,
      repo: &models::Repository,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result<Task> {
      const F: &str = "[Project::edit_task]";

      let tasks = match &mut self.tasks {
         Some(tasks) => tasks,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no tasks", self.name),
               F,
               None,
            ))
         }
      };

      let task = match tasks.iter_mut().find(|t| t.get_inner_issue().id.to_string() == task_id) {
         Some(task) => task,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no task with id {task_id}", self.name),
               F,
               None,
            ))
         }
      };

      let updated_issue = GithubAPI::update_issue(
         task.get_inner_issue(),
         repo,
         token,
         Some(&payload.title),
         payload.body.as_deref(),
         Some(&[payload.assignee_login]),
         Some(
            &task
               .get_inner_issue()
               .labels
               .iter()
               .map(|label| {
                  let label = label.name.trim().to_lowercase();
                  if label.ends_with("-priority") {
                     payload.priority.to_string() // overide TaskPriority
                  } else {
                     label
                  }
               })
               .collect::<Vec<_>>(),
         ),
         None,
      )
      .await?;

      task.update(Some(payload.priority), None, None, Some(updated_issue), None);
      let updated_task = task.to_owned();
      self.save_updates_to_store(store)?;

      Ok(updated_task)
   }

   pub async fn edit_draft_task(
      &mut self,
      draft_id: &str,
      payload: NewDraftTaskPayload,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result<DraftTask> {
      const F: &str = "[Project::edit_draft_task]";

      let draft_tasks = match &mut self.draft_tasks {
         Some(draft_tasks) => draft_tasks,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no draft tasks", self.name),
               F,
               None,
            ))
         }
      };

      let draft_task = match draft_tasks.iter_mut().find(|t| t.get_id() == draft_id) {
         Some(draft_task) => draft_task,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no draft task with id {draft_id}", self.name),
               F,
               None,
            ))
         }
      };

      draft_task.update(payload, &self.team);
      let updated_draft_task = draft_task.to_owned();
      self.save_updates_to_store(store)?;

      Ok(updated_draft_task)
   }

   pub async fn delete_task(
      &mut self,
      task_id: &str,
      token: &AccessToken,
      repo: &models::Repository,
      store: Arc<Store<impl Runtime>>,
   ) -> crate::Result {
      const F: &str = "[Project::delete_task]";

      let tasks = match &mut self.tasks {
         Some(tasks) => tasks,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no tasks", self.name),
               F,
               None,
            ))
         }
      };

      let task = match tasks.iter_mut().find(|t| t.get_inner_issue().id.to_string() == task_id) {
         Some(task) => task,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no task with id {task_id}", self.name),
               F,
               None,
            ))
         }
      };

      // close issue and append 'deleted' label for now (TODO: delete using grapgql in future)
      GithubAPI::update_issue(
         task.get_inner_issue(),
         repo,
         token,
         None,
         None,
         None,
         Some(&[String::from("deleted")]),
         Some(models::IssueState::Closed),
      )
      .await?;

      *tasks = tasks
         .into_iter()
         .filter(|t| t.get_inner_issue().id.to_string() != task_id)
         .map(|t| t.to_owned())
         .collect();

      self.save_updates_to_store(store)?;

      Ok(())
   }

   pub async fn delete_permanently(self, token: &AccessToken, store: Arc<Store<impl Runtime>>) -> crate::Result {
      const F: &str = "[GithubAPI::delete_permanently]";

      GithubAPI::delete_repo(&self.repo, token).await?;
      store.delete(&self.id);

      // update project-ids
      if let Some(project_ids) = store.get("project-ids") {
         let mut project_ids = serde_json::from_value::<Vec<String>>(project_ids)
            .map_err(|e| AppError::unknown(&format!("could not deserialize project-ids: {e}"), F, None))?;

         project_ids = project_ids
            .iter()
            .filter(|id| id.to_string() != self.id)
            .map(|id| id.to_owned())
            .collect();
         store.set("project-ids", project_ids);
      }

      // update repo-ids
      if let Some(repo_ids) = store.get("repo-ids") {
         let mut repo_ids = serde_json::from_value::<Vec<String>>(repo_ids)
            .map_err(|e| AppError::unknown(&format!("could not deserialize repo-ids: {e}"), F, None))?;

         repo_ids = repo_ids
            .iter()
            .filter(|id| id.to_string() != self.repo_id)
            .map(|id| id.to_owned())
            .collect();
         store.set("repo-ids", repo_ids);
      }

      Ok(())
   }

   pub fn delete_locally(self, store: Arc<Store<impl Runtime>>) -> crate::Result {
      const F: &str = "[GithubAPI::delete_locally]";

      store.delete(&self.id);

      // update project-ids
      if let Some(project_ids) = store.get("project-ids") {
         let mut project_ids = serde_json::from_value::<Vec<String>>(project_ids)
            .map_err(|e| AppError::unknown(&format!("could not deserialize project-ids: {e}"), F, None))?;

         project_ids = project_ids
            .iter()
            .filter(|id| id.to_string() != self.id)
            .map(|id| id.to_owned())
            .collect();
         store.set("project-ids", project_ids);
      }

      // update repo-ids
      if let Some(repo_ids) = store.get("repo-ids") {
         let mut repo_ids = serde_json::from_value::<Vec<String>>(repo_ids)
            .map_err(|e| AppError::unknown(&format!("could not deserialize repo-ids: {e}"), F, None))?;

         repo_ids = repo_ids
            .iter()
            .filter(|id| id.to_string() != self.repo_id)
            .map(|id| id.to_owned())
            .collect();
         store.set("repo-ids", repo_ids);
      }

      Ok(())
   }

   pub async fn delete_draft_task(&mut self, draft_id: &str, store: Arc<Store<impl Runtime>>) -> crate::Result {
      const F: &str = "[Project::delete_draft_task]";

      let draft_tasks = match &mut self.draft_tasks {
         Some(draft_tasks) => draft_tasks,
         None => {
            return Err(AppError::unknown(
               &format!("project {} has no draft tasks", self.name),
               F,
               None,
            ))
         }
      };

      *draft_tasks = draft_tasks
         .into_iter()
         .filter(|d| d.get_id() != draft_id)
         .map(|t| t.to_owned())
         .collect();

      self.save_updates_to_store(store)?;

      Ok(())
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

   pub async fn map_issues_to_tasks_with_review_status(
      issues: Vec<models::issues::Issue>,
      token: &AccessToken,
   ) -> crate::Result<Vec<Task>> {
      // if a 'pull_request' issue is found, it will not map to a new task, it will be saved into a special vec 'pull_requests'
      let pull_requests = issues
         .iter()
         .filter_map(|issue| {
            if issue.state == models::IssueState::Closed {
               None
            } else {
               issue.pull_request.clone()
            }
         })
         .collect::<Vec<_>>();

      // all other issues have their task's 'is_under_review' root field set to false
      let mut tasks = issues
         .into_iter()
         .filter(|issue| issue.pull_request.is_none())
         .map(|issue| Task::from_issue(issue))
         .collect::<Vec<Task>>();

      // after all tasks are created from issues, 'pull_request' issues are iterated and their branch names identified
      let mut pull_request_branch_names = vec![];
      for pull_req in pull_requests {
         let (branch_name, _) = GithubAPI::request::<models::pulls::PullRequest, Value>(
            Method::GET,
            format!("{}?{}", pull_req.url.path(), pull_req.url.query().unwrap_or("")),
            &token,
            None,
         )
         .await?;
         pull_request_branch_names.push(branch_name.head.ref_field);
      }

      for task in tasks.iter_mut() {
         // if one of the above branch names corresponds to a task, task will have 'is_under_review' set to 'true'
         let is_under_review = pull_request_branch_names
            .iter()
            .any(|n| n.eq(&task.get_inner_issue().task_branch_name()));
         task.update(None, None, Some(is_under_review), None, None);
      }

      Ok(tasks)
   }

   pub async fn update_repo(
      &mut self,
      new_repo_name: Option<String>,
      new_repo_is_private: Option<bool>,
      store: Arc<Store<impl Runtime>>,
      token: &AccessToken,
   ) -> crate::Result {
      const F: &str = "[Project::update_repo]";

      log!(
         "{F} updating repo '{}' with {new_repo_name:?}, {new_repo_is_private:?}",
         self.repo.name
      );
      let payload = RepoPayload::new(new_repo_name, new_repo_is_private);

      let new_repo = GithubAPI::update_repo(payload, &self.repo, token).await?;
      self.repo = new_repo;

      self.save_updates_to_store(store)
   }

   pub fn name(&self) -> &str {
      &self.name
   }

   pub fn repo(&self) -> &models::Repository {
      &self.repo
   }
}

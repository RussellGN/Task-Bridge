use std::fmt::Display;

use octocrab::models;
use serde::{Deserialize, Serialize};

use crate::{error::AppError, utils::new_id};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum TaskPriority {
   Low,
   Normal,
   High,
   Urgent,
}

impl Default for TaskPriority {
   fn default() -> Self {
      Self::Normal
   }
}

impl Display for TaskPriority {
   fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
      write!(
         f,
         "{}",
         match self {
            TaskPriority::Low => "low",
            TaskPriority::Normal => "normal",
            TaskPriority::High => "high",
            TaskPriority::Urgent => "urgent",
         }
      )
   }
}

impl TaskPriority {
   pub fn from_label(label: models::Label) -> Self {
      let s = label.name.trim().to_lowercase().replace("-priority", "");
      let priority = serde_json::from_str::<TaskPriority>(&format!("\"{s}\"")).unwrap_or(TaskPriority::Normal);
      priority
   }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DraftTask {
   id: String,
   title: String,
   body: Option<String>,
   assignee: Option<models::Author>,
   priority: Option<TaskPriority>,
}

impl DraftTask {
   pub fn new(
      title: String,
      body: Option<String>,
      assignee: Option<models::Author>,
      priority: Option<TaskPriority>,
   ) -> Self {
      Self {
         id: new_id(),
         title,
         body,
         assignee,
         priority,
      }
   }

   pub fn update(&mut self, payload: NewDraftTaskPayload, team: &Vec<models::Author>) {
      self.title = payload.title;
      self.body = payload.body;
      self.priority = payload.priority;

      let assignee = match payload.assignee_login {
         Some(login) => team.iter().find(|member| member.login == login),
         None => None,
      };

      self.assignee = assignee.cloned();
   }

   pub fn get_id(&self) -> &str {
      &self.id
   }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Task {
   priority: TaskPriority,
   inner_issue: models::issues::Issue,
   is_backlog: Option<bool>,
   is_under_review: Option<bool>,
   commits: Option<Vec<models::repos::RepoCommit>>,
}

impl Task {
   pub fn from_issue(issue: models::issues::Issue) -> Self {
      let priority = issue
         .labels
         .iter()
         .find(|label| label.name.to_lowercase().trim().ends_with("-priority"))
         .map(|label| TaskPriority::from_label(label.clone()))
         .unwrap_or(TaskPriority::Normal);

      let is_backlog = issue
         .labels
         .iter()
         .find(|label| label.name.to_lowercase().trim() == "backlog")
         .is_some();

      Self {
         priority,
         inner_issue: issue,
         is_backlog: Some(is_backlog),
         is_under_review: None,
         commits: None,
      }
   }

   pub fn update(
      &mut self,
      updated_priority: Option<TaskPriority>,
      updated_is_backlog: Option<bool>,
      updated_is_under_review: Option<bool>,
      updated_inner_issue: Option<models::issues::Issue>,
      updated_commits: Option<Vec<models::repos::RepoCommit>>,
   ) {
      if let Some(priority) = updated_priority {
         self.priority = priority
      }
      if let Some(is_backlog) = updated_is_backlog {
         self.is_backlog = Some(is_backlog)
      }
      if let Some(is_under_review) = updated_is_under_review {
         self.is_under_review = Some(is_under_review)
      }
      if let Some(inner_issue) = updated_inner_issue {
         self.inner_issue = inner_issue
      }
      if updated_commits.is_some() {
         self.commits = updated_commits
      }
   }

   pub fn get_inner_issue(&self) -> &models::issues::Issue {
      &self.inner_issue
   }

   pub fn is_corresponding_branch(&self, branch_name: &str) -> bool {
      branch_name.ends_with(&format!("_{}", self.inner_issue.number))
   }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NewTaskPayload {
   pub title: String,
   pub body: Option<String>,
   pub assignee_login: String,
   pub priority: TaskPriority,
   pub project_id: String,
}

impl NewTaskPayload {
   pub fn from_draft_task_and_project_id(draft: DraftTask, project_id: String) -> crate::Result<Self> {
      const F: &str = "[NewTaskPayload::from_draft_task_and_project_id]";

      Ok(Self {
         title: draft.title,
         body: draft.body,
         assignee_login: draft
            .assignee
            .ok_or(AppError::unknown(
               "Draft task does not have an assignee. This is required!",
               F,
               None,
            ))?
            .login,
         priority: draft.priority.unwrap_or_default(),
         project_id,
      })
   }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NewDraftTaskPayload {
   pub title: String,
   pub body: Option<String>,
   pub assignee_login: Option<String>,
   pub priority: Option<TaskPriority>,
   pub project_id: String,
}

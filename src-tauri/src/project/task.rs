use std::fmt::Display;

use octocrab::models;
use serde::{Deserialize, Serialize};

use crate::utils::new_id;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum TaskPriority {
   Low,
   Normal,
   High,
   Urgent,
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
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Task {
   priority: TaskPriority,
   is_backlog: Option<bool>,
   inner_issue: models::issues::Issue,
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
      }
   }

   pub fn update(
      &mut self,
      updated_priority: Option<TaskPriority>,
      updated_is_backlog: Option<bool>,
      updated_inner_issue: Option<models::issues::Issue>,
   ) {
      if let Some(priority) = updated_priority {
         self.priority = priority
      }
      if let Some(is_backlog) = updated_is_backlog {
         self.is_backlog = Some(is_backlog)
      }
      if let Some(inner_issue) = updated_inner_issue {
         self.inner_issue = inner_issue
      }
   }

   pub fn get_inner_issue(&self) -> &models::issues::Issue {
      &self.inner_issue
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

#[derive(Serialize, Deserialize, Debug)]
pub struct NewDraftTaskPayload {
   pub title: String,
   pub body: Option<String>,
   pub assignee_login: Option<String>,
   pub priority: Option<TaskPriority>,
   pub project_id: String,
}

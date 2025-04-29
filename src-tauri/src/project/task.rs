use std::fmt::Display;

use octocrab::models;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DraftTask {
   id: String,
   title: String,
   body: Option<String>,
   assignee: Option<models::Author>,
   priority: Option<TaskPriority>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Task {
   priority: TaskPriority,
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

      Self {
         priority,
         inner_issue: issue,
      }
   }
}

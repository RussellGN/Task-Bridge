use std::fmt::Display;

use octocrab::models;
use serde::{Deserialize, Serialize};

#[derive(Debug)]
pub enum TaskPriority {
   Low,
   Normal,
   High,
   Urgent,
}

impl Serialize for TaskPriority {
   fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
   where
      S: serde::Serializer,
   {
      serializer.serialize_str(&self.to_string())
   }
}

impl<'de> Deserialize<'de> for TaskPriority {
   fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
   where
      D: serde::Deserializer<'de>,
   {
      let s = String::deserialize(deserializer)?;
      match s.as_str() {
         "low" => Ok(TaskPriority::Low),
         "normal" => Ok(TaskPriority::Normal),
         "high" => Ok(TaskPriority::High),
         "urgent" => Ok(TaskPriority::Urgent),
         _ => Err(serde::de::Error::custom(format!("Invalid task priority: {}", s))),
      }
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
      let s = label.description.unwrap_or("normal".into());
      let priority = serde_json::from_str::<TaskPriority>(&s).unwrap_or(TaskPriority::Normal);
      priority
   }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Task {
   is_draft: Option<bool>,
   priority: TaskPriority,
   inner_issue: Option<models::issues::Issue>,
}

impl Task {
   pub fn from_issue(issue: models::issues::Issue) -> Self {
      let priority = issue
         .labels
         .iter()
         .find(|label| label.name.to_lowercase() == "has-priority")
         .map(|label| TaskPriority::from_label(label.clone()))
         .unwrap_or(TaskPriority::Normal);

      Self {
         is_draft: Some(false),
         priority,
         inner_issue: Some(issue),
      }
   }
}

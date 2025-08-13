use std::sync::Arc;

use serde::{Deserialize, Serialize};
use tauri::Runtime;
use tauri_plugin_store::Store;

use crate::{utils::new_id, ArcStoreOption};

#[derive(Deserialize, Serialize, Debug)]
pub enum LogType {
   INFO,
   ERROR,
   SUCCESS,
}

#[derive(Deserialize, Serialize)]
pub struct Log {
   log_type: LogType,
   title: String,
   body: Option<String>,
   context: Option<String>,
}

impl Log {
   pub fn new(log_type: LogType, title: String, body: Option<String>, context: Option<String>) -> Self {
      Self {
         log_type,
         title,
         body,
         context,
      }
   }

   pub async fn persist<R: Runtime>(self, logs_store: ArcStoreOption<R>) {
      if let Some(logs_store) = logs_store {
         self.persist_to_logs_store(logs_store)
      }
   }

   fn generate_id(&self) -> String {
      format!(
         "{}__{:?}__{}",
         chrono::Utc::now().timestamp_micros(),
         self.log_type,
         new_id()
      )
   }

   fn persist_to_logs_store<R: Runtime>(self, logs_store: Arc<Store<R>>) {
      let id = self.generate_id();

      if let Ok(val) = serde_json::to_value(self) {
         logs_store.set(id, val);
      }
   }
}

use colored::Colorize;
use octocrab::{models, Octocrab, OctocrabBuilder};
use std::{collections::HashMap, sync::Arc};
use tauri::{AppHandle, Runtime};
use tauri_plugin_store::{Store, StoreExt};
use uuid::Uuid;

use crate::{auth::AccessToken, ENV_STR, STORE_PATH};

#[macro_export]
macro_rules! log {
   () => {
      println!();
   };
   ($($arg:tt)*) => {{
      use colored::Colorize;
      print!("{}", "|".purple());
      print!("{}", "--> ".yellow());
      let s = format!($($arg)*);

      let (func_name, msg) = if s.starts_with("[") {
         let split = s.split("]")
            .collect::<Vec<_>>();

            let func_name =
            split.first()
            .unwrap_or(&"[")
            .get(1..)
            .unwrap_or("");

            let msg = split.get(1).unwrap_or(&s.as_str()).to_string();
         (func_name, msg)
      } else {
         ("", s)
      };
      print!("{} {msg}", func_name.cyan());
      println!("\n{}", "|".purple());
   }};
}

pub fn dbg_store(store: &Store<impl Runtime>) {
   let store = store.entries();
   println!("{}", "-------------store debug--------------".cyan());
   println!("{store:#?}");
   println!("{}", "--------------------------------------".cyan());
}

pub fn get_env_vars() -> crate::Result<HashMap<String, String>> {
   const F: &str = "[get_env_vars]";
   let env_vars = ENV_STR
      .split("\n")
      .map(|pair| {
         pair
            .split("=")
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>()
      })
      .collect::<Vec<Vec<_>>>();

   let mut env_vars_map = std::collections::HashMap::new();

   for pair in env_vars.into_iter() {
      if pair.is_empty() {
         continue;
      }
      let name = pair.get(0).ok_or(format!("{F} could not access env vars"))?.to_string();
      let value = pair.get(1).ok_or(format!("{F} could not access env vars"))?.to_string();
      env_vars_map.insert(name, value);
   }

   Ok(env_vars_map)
}

pub fn get_store<R: Runtime>(app: AppHandle<R>) -> crate::Result<Arc<Store<R>>> {
   const F: &str = "[get_store]";

   log!("{F} getting store");
   let store = app.store(STORE_PATH).map_err(|e| format!("{F} {}", e.to_string()))?;

   Ok(store)
}

pub fn get_token<R: Runtime>(store: &Arc<Store<R>>) -> crate::Result<AccessToken> {
   const F: &str = "[get_token]";

   log!("{F} getting token");
   let token = store.get("token").ok_or(format!("{F} token not found"))?;
   log!("{F} token value: {token:#?}");
   let token = serde_json::from_value::<AccessToken>(token).map_err(|e| e.to_string())?;

   Ok(token)
}

pub fn create_authenticated_octo(token: &str) -> crate::Result<Octocrab> {
   const F: &str = "[create_authenticated_octo]";

   log!("{F} creating octo with authentication");
   let octo = OctocrabBuilder::new()
      .user_access_token(token)
      .build()
      .map_err(|e| format!("{F} {}", e.to_string()))?;

   Ok(octo)
}

pub fn new_id() -> String {
   Uuid::new_v4().to_string()
}

pub trait IssueExt {
   fn was_deleted(&self) -> bool;

   fn task_branch_name(&self) -> String;
}

impl IssueExt for models::issues::Issue {
   fn was_deleted(&self) -> bool {
      self.state == models::IssueState::Closed && self.labels.iter().any(|l| l.name.as_str() == "deleted")
   }

   fn task_branch_name(&self) -> String {
      format!("task/{}", self.number)
   }
}

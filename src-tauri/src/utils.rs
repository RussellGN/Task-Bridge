use std::{collections::HashMap, sync::Arc};

use octocrab::{Octocrab, OctocrabBuilder};
use tauri::{AppHandle, Runtime};
use tauri_plugin_store::{Store, StoreExt};

use crate::{auth::AccessToken, ENV_STR, STORE_PATH};

#[macro_export]
macro_rules! log {
   () => {
      println!();
   };
   ($($arg:tt)*) => {{
      println!($($arg)*);
   }};
}

pub fn dbg_store(store: &Store<impl Runtime>) {
   let store = store.entries();
   println!("-------------store debug--------------");
   println!("{store:#?}");
   println!("--------------------------------------");
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

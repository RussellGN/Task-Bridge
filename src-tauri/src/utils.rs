use std::collections::HashMap;

use tauri::Runtime;
use tauri_plugin_store::Store;

use crate::ENV_STR;

pub fn log(msg: impl Into<String>) {
   println!("{}", msg.into());
}

pub fn dbg_store(store: &Store<impl Runtime>) {
   let store = store.entries();
   println!("-------------store debug--------------");
   println!("{store:#?}");
   println!("--------------------------------------");
}

pub fn get_env_vars() -> crate::Result<HashMap<String, String>> {
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
      let name = pair.get(0).ok_or("could not access env vars")?.to_string();
      let value = pair.get(1).ok_or("could not access env vars")?.to_string();
      env_vars_map.insert(name, value);
   }

   Ok(env_vars_map)
}

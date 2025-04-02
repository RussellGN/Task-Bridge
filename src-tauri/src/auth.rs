use std::{collections::HashMap, error::Error};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Runtime, Url};
use tauri_plugin_store::StoreExt;

use crate::{github_api, log, utils::dbg_store, STORE_PATH};

#[derive(Debug, Deserialize, Serialize)]
pub struct AccessToken(String);

impl AccessToken {
   pub fn new(access_token: String) -> Self {
      Self(access_token)
   }

   pub fn get_token(&self) -> String {
      self.0.clone()
   }
}

pub fn proceed_to_auth(url: &Url, app: &AppHandle<impl Runtime>) -> Result<(), Box<dyn Error>> {
   let path = url.path();
   let query_params = url.query_pairs().collect::<HashMap<_, _>>();
   let code = query_params.get("code");
   let state = query_params.get("state");
   log!("[proceed_to_auth] path: {path}\ncode: {code:?}\nstate: {state:?}");

   if let (Some(auth_keyword), Some(code)) = (state, code) {
      log!("[proceed_to_auth] about to validate auth keyword");
      validate_auth_keyword(auth_keyword.as_ref())?;

      log!("[proceed_to_auth] about to exchange code for token");
      let token = github_api::exchange_code_for_access_token(code.as_ref())?;

      let store = app.store(STORE_PATH)?;
      dbg_store(&store);
      store.set("token", serde_json::to_value(token)?);
      dbg_store(&store);

      log!("about to emit ready event");
      app.emit("auth-setup-complete", "auth setup completed")?;
      log!("ready event emitted!");
   } else {
      log!("error: {:#?}", (state, code));
   }

   Ok(())
}

fn validate_auth_keyword(_auth_keyword: &str) -> crate::Result {
   Ok(())
}

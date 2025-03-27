use std::{collections::HashMap, error::Error};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Runtime, Url};
use tauri_plugin_store::StoreExt;

use crate::{
   utils::{dbg_store, log},
   STORE_PATH,
};

pub fn handle_auth_setup(url: &Url, app: &AppHandle<impl Runtime>) -> Result<(), Box<dyn Error>> {
   let path = url.path();
   let query_params = url.query_pairs().collect::<HashMap<_, _>>();
   let code = query_params.get("code");
   let state = query_params.get("state");
   log(format!(
      "path: {path}\ncode: {code:?}\nstate: {state:?}\nfull url: {}",
      url.as_str()
   ));

   if let (Some(auth_keyword), Some(code)) = (state, code) {
      log("about to validate auth");
      validate_auth_keyword(auth_keyword.as_ref())?;

      log("about to exchange code for token");
      // exchange code for user access token
      let token = AccessToken::exchange_code_for_access_token(code.as_ref())?;

      log("getting store");
      let store = app.store(STORE_PATH)?;
      dbg_store(&store);
      // store token, re-store old token if it exists
      if let Some(old_token) = store.get("token") {
         store.set("old_token", old_token.to_string());
         log(format!(
            "found old token in store: {}, overiding with {token:#?}",
            old_token.to_string()
         ));
      }
      let token = serde_json::to_string(&token)?;
      store.set("token", token.clone());

      dbg_store(&store);

      log("about to emit ready event");
      // route frontend to path
      let message = format!("auth setup completed. Token is '{token}', code was: {} ", code.as_ref());
      app.emit("auth-setup-complete", message)?;

      log("ready event emitted!");
   }

   Ok(())
}

fn validate_auth_keyword(_auth_keyword: &str) -> Result<(), String> {
   Ok(())
}

#[derive(Debug, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase")]
struct AccessToken {
   access_token: String,
   expires_in: Option<usize>,
   refresh_token: Option<String>,
   refresh_token_expires_in: Option<usize>,
   scope: String,
   token_type: String,
}

impl AccessToken {
   fn exchange_code_for_access_token(_code: &str) -> Result<Self, String> {
      let fake_token = AccessToken::default();
      // TODO: get actual access token
      Ok(fake_token)
   }
}

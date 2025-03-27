use std::{collections::HashMap, error::Error};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Runtime, Url};
use tauri_plugin_store::StoreExt;

use crate::{utils::log, STORE_PATH};

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
      validate_auth_keyword(auth_keyword.as_ref())?;

      // exchange code for user access token
      let token = exchange_code_for_access_token(code.as_ref())?;

      let store = app.store(STORE_PATH)?;
      // store token, re-store old token if it exists
      if let Some(old_token) = store.get("token") {
         store.set("old_token", old_token.to_string());
         log(format!(
            "found old token in store: {}, overiding with {token:#?}",
            old_token.to_string()
         ));
         let token = serde_json::to_string(&token)?;
         store.set("token", token);
      }

      // route frontend to path
   }

   Ok(())
}

fn validate_auth_keyword(_auth_keyword: &str) -> Result<(), String> {
   Ok(())
}

#[derive(Debug, Deserialize, Serialize)]
struct AccessToken;

fn exchange_code_for_access_token(_code: &str) -> Result<AccessToken, String> {
   let fake_token = AccessToken;
   Ok(fake_token)
   // todo!()
}

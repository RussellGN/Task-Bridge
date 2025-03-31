use std::{collections::HashMap, error::Error};

use serde::{Deserialize, Serialize};
use tauri::{http::Method, AppHandle, Emitter, Runtime, Url};
use tauri_plugin_http::reqwest;
use tauri_plugin_store::StoreExt;

use crate::{
   utils::{dbg_store, log},
   STORE_PATH,
};

pub fn proceed_to_auth(url: &Url, app: &AppHandle<impl Runtime>) -> Result<(), Box<dyn Error>> {
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

fn validate_auth_keyword(_auth_keyword: &str) -> crate::Result {
   Ok(())
}

#[derive(Debug, Deserialize, Serialize, Default)]
// #[serde(rename_all = "camelCase")]
pub struct AccessToken {
   access_token: String,
   scope: String,
   token_type: String,
}

impl AccessToken {
   fn new(access_token: String, scope: String, token_type: String) -> Self {
      Self {
         access_token,
         scope,
         token_type,
      }
   }

   pub fn get_token(&self) -> String {
      self.access_token.clone()
   }

   fn exchange_code_for_access_token(code: &str) -> crate::Result<Self> {
      let env_vars = dotenv::vars().collect::<HashMap<_, _>>();
      let client_id = env_vars
         .get("VITE_CLIENT_ID")
         .ok_or(String::from("failed to load CLIENT_ID var"))?;
      let client_secret = env_vars
         .get("VITE_CLIENT_SECRET")
         .ok_or(String::from("failed to load CLIENT_SECRET var"))?;

      let mut code_exchange_url =
         Url::parse("https://github.com/login/oauth/access_token").map_err(|e| e.to_string())?;

      code_exchange_url
         .query_pairs_mut()
         .append_pair("client_id", client_id)
         .append_pair("client_secret", client_secret)
         .append_pair("code", code);

      log(code_exchange_url.as_str());
      let req = reqwest::blocking::Request::new(Method::POST, code_exchange_url);
      let res = reqwest::blocking::Client::new()
         .execute(req)
         .map_err(|e| e.to_string())?;

      let bytes = res.bytes().map_err(|e| e.to_string())?.to_vec();
      let params = String::from_utf8(bytes).map_err(|e| e.to_string())?;
      let param_pairs_list = params
         .split("&")
         .map(|query_pair| query_pair.split("=").map(|item| item.to_string()).collect::<Vec<_>>())
         .collect::<Vec<Vec<_>>>();

      let mut params: HashMap<String, String> = HashMap::new();

      for k_v_pair in param_pairs_list.clone() {
         if let [k, v] = k_v_pair.as_slice() {
            params.insert(k.to_string(), v.to_string());
         } else {
            return  Err(format!("[AccessToken::exchange_code_for_token] param_pairs_list does not contain key-value pairs: {param_pairs_list:#?}"));
         }
      }

      let access_token = params
         .get("access_token")
         .ok_or("access_token was nott ofund in params")?
         .to_string();
      let scope = params.get("scope").ok_or("scope was nott ofund in params")?.to_string();
      let token_type = params
         .get("token_type")
         .ok_or("token_type was nott ofund in params")?
         .to_string();
      let token = Self::new(access_token, scope, token_type);

      log(format!("token: {token:?}"));

      Ok(token)
   }
}

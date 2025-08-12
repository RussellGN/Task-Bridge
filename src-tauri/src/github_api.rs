use std::collections::HashMap;

use tauri::{http::Method, Url};
use tauri_plugin_http::reqwest;

use crate::{auth::AccessToken, error::AppError, log, utils::get_env_vars};

pub fn exchange_code_for_access_token(code: &str) -> crate::Result<AccessToken> {
   const F: &str = "[exchange_code_for_access_token]";

   let env_vars_map = get_env_vars()?;
   let client_id = env_vars_map
      .get("CLIENT_ID")
      .ok_or(AppError::unknown("failed to load CLIENT_ID var", F, None))?;
   let client_secret =
      env_vars_map
         .get("CLIENT_SECRET")
         .ok_or(AppError::unknown("Failed to load CLIENT_SECRET var", F, None))?;

   let mut code_exchange_url = Url::parse("https://github.com/login/oauth/access_token")
      .map_err(|e| AppError::unknown(&e.to_string(), F, None))?;

   code_exchange_url
      .query_pairs_mut()
      .append_pair("client_id", client_id)
      .append_pair("client_secret", client_secret)
      .append_pair("code", code);

   log!("{F} {}", code_exchange_url.as_str());
   let req = reqwest::blocking::Request::new(Method::POST, code_exchange_url);
   let res = reqwest::blocking::Client::new()
      .execute(req)
      .map_err(|e| AppError::unknown(&e.to_string(), F, None))?;

   let bytes = res
      .bytes()
      .map_err(|e| AppError::unknown(&e.to_string(), F, None))?
      .to_vec();
   let params = String::from_utf8(bytes).map_err(|e| AppError::unknown(&e.to_string(), F, None))?;
   let param_pairs_list = params
      .split("&")
      .map(|query_pair| query_pair.split("=").map(|item| item.to_string()).collect::<Vec<_>>())
      .collect::<Vec<Vec<_>>>();

   let mut params: HashMap<String, String> = HashMap::new();

   for k_v_pair in param_pairs_list.clone() {
      if let [k, v] = k_v_pair.as_slice() {
         params.insert(k.to_string(), v.to_string());
      } else {
         return Err(AppError::unknown(
            "param_pairs_list does not contain key-value pairs: {param_pairs_list:#?}",
            F,
            None,
         ));
      }
   }

   let access_token = params
      .get("access_token")
      .ok_or(AppError::unknown("access_token was not found in params", F, None))?
      .to_string();

   let token = AccessToken::new(access_token);
   log!("{F} token: {token:?}");

   Ok(token)
}

use std::{collections::HashMap, fmt::Debug};

use tauri::{
   http::{header, HeaderValue, Method, StatusCode},
   Runtime, Url,
};
use tauri_plugin_http::reqwest;
use tauri_plugin_store::Store;

use crate::{auth::AccessToken, ENV_STR};

pub fn log(msg: impl Into<String>) {
   println!("{}", msg.into());
}

pub fn dbg_store(store: &Store<impl Runtime>) {
   let store = store.entries();

   println!("-------------store debug--------------");
   println!("{store:#?}");
   println!("--------------------------------------");
}

pub async fn user_github_request_async<'a, T>(
   user_access_token: &AccessToken,
   mut url: Url,
   method: Method,
   query_params: Option<HashMap<String, String>>,
) -> crate::Result<T>
where
   T: Debug + serde::de::DeserializeOwned,
{
   if let Some(query_params) = query_params {
      query_params.iter().for_each(|(n, v)| {
         url.query_pairs_mut().append_pair(n, v);
      });
   }

   log(url.as_str());
   let mut req = reqwest::Request::new(method, url);

   req.headers_mut()
      .append(header::ACCEPT, HeaderValue::from_static("application/json"));

   req.headers_mut()
      .append(header::USER_AGENT, HeaderValue::from_static("reqwest"));

   let auth_header = format!("Bearer {}", user_access_token.get_token());
   req.headers_mut().append(
      header::AUTHORIZATION,
      HeaderValue::from_str(&auth_header).map_err(|e| e.to_string())?,
   );
   req.headers_mut()
      .append("X-GitHub-Api-Version", HeaderValue::from_static("2022-11-28"));

   log(format!("req = {req:#?}"));
   let res = reqwest::Client::new().execute(req).await.map_err(|e| e.to_string())?;

   log(format!("status: {}", res.status().as_str()));

   if res.status() == StatusCode::OK {
      let res_data = res.json::<T>().await.map_err(|e| e.to_string())?;

      log(format!("res data: {res_data:?}"));

      Ok(res_data)
   } else {
      log(format!("request failed res = {res:?}"));
      Err("request failed".to_string())
   }
}

pub fn _user_github_request_sync<'a, T>(
   user_access_token: &AccessToken,
   mut url: Url,
   method: Method,
   query_params: Option<HashMap<String, String>>,
) -> crate::Result<T>
where
   T: Debug + serde::de::DeserializeOwned,
{
   if let Some(query_params) = query_params {
      query_params.iter().for_each(|(n, v)| {
         url.query_pairs_mut().append_pair(n, v);
      });
   }

   log(url.as_str());
   let mut req = reqwest::blocking::Request::new(method, url);

   req.headers_mut()
      .append(header::ACCEPT, HeaderValue::from_static("application/json"));

   let auth_header = format!("Bearer {}", user_access_token.get_token());
   req.headers_mut().append(
      header::AUTHORIZATION,
      HeaderValue::from_str(&auth_header).map_err(|e| e.to_string())?,
   );
   req.headers_mut()
      .append("X-GitHub-Api-Version", HeaderValue::from_static("2022-11-28"));

   let res = reqwest::blocking::Client::new()
      .execute(req)
      .map_err(|e| e.to_string())?;

   let res_data = res.json::<T>().map_err(|e| e.to_string())?;

   log(format!("res data: {res_data:?}"));

   Ok(res_data)
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

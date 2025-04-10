use std::fmt::Debug;

use serde::{de::DeserializeOwned, Serialize};
use tauri::http::{header, Method};
use tauri_plugin_http::reqwest;

use crate::{auth::AccessToken, log};

const GITHUB_API_BASENAME: &str = "https://api.github.com";

#[derive(Debug)]
#[allow(unused)]
pub struct GithubResponseParts {
   status: reqwest::StatusCode,
   headers: reqwest::header::HeaderMap,
   url: reqwest::Url,
}

#[allow(unused)]
impl GithubResponseParts {
   pub fn status(&self) -> &reqwest::StatusCode {
      &self.status
   }

   pub fn headers(&self) -> &reqwest::header::HeaderMap {
      &self.headers
   }

   pub fn url(&self) -> &reqwest::Url {
      &self.url
   }
}

pub struct GithubAPI;

impl GithubAPI {
   pub async fn request<R, P>(
      method: Method,
      path_with_query_str: impl Into<String>,
      token: &AccessToken,
      payload: Option<P>,
   ) -> crate::Result<(R, GithubResponseParts)>
   where
      R: DeserializeOwned + Debug,
      P: Serialize + Debug,
   {
      const F: &str = "[GithubAPI::request]";

      // formulate url
      let path = path_with_query_str.into();
      let path = if path.starts_with("/") {
         path
      } else {
         format!("/{path}")
      };
      let url = format!("{GITHUB_API_BASENAME}{path}");

      // build request, with headers: auth, user-agent, accept
      let req = reqwest::Client::new()
         .request(method, url)
         .bearer_auth(token.get_token())
         .header(header::USER_AGENT, "task-bridge")
         .header(header::ACCEPT, "application/json")
         .json(&payload)
         .build()
         .map_err(|e| format!("{F} failed to build request, error: {}", e.to_string()))?;

      // log request
      log!("{F} request built successfully, request: {req:#?}");

      // send request
      let res = reqwest::Client::new()
         .execute(req)
         .await
         .map_err(|e| format!("{F} error sending request, error: {}", e.to_string()))?;

      // log response
      log!("{F} request sent successfully, got response: {res:#?}");

      // create response parts
      let parts = GithubResponseParts {
         status: res.status(),
         headers: res.headers().clone(),
         url: res.url().clone(),
      };
      log!("{F} response parts: {parts:#?}");

      // log and return reponse data
      let json_data = res
         .json::<R>()
         .await
         .map_err(|e| format!("{F} error sending request, error: {}", e.to_string()))?;
      log!("{F} response json: {json_data:#?}");

      Ok((json_data, parts))
   }
}

use std::fmt::Debug;

use octocrab::models;
use serde::{de::DeserializeOwned, Serialize};
use serde_json::Value;
use tauri::http::{header, Method};
use tauri_plugin_http::reqwest;

use crate::{auth::AccessToken, log, utils::create_authenticated_octo};

const GITHUB_API_BASENAME: &str = "https://api.github.com";

#[derive(Serialize, Debug)]
pub struct RepoPayload {
   name: String,
}

impl RepoPayload {
   pub fn new(name: String) -> Self {
      Self { name }
   }
}

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
      path_query: impl Into<String>,
      token: &AccessToken,
      payload: Option<P>,
   ) -> crate::Result<(R, GithubResponseParts)>
   where
      R: DeserializeOwned + Debug,
      P: Serialize + Debug,
   {
      const F: &str = "[GithubAPI::request]";

      // formulate url
      let path = path_query.into();
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

   pub async fn get_user(token: &AccessToken) -> crate::Result<models::Author> {
      const F: &str = "[GithubAPI::get_user]";

      let octo = create_authenticated_octo(&token.get_token())?;
      log!("{F} fetching authenticated user");
      let user = octo.current().user().await.map_err(|e| e.to_string())?;
      log!("{F} got user, now returning: {}", user.login);

      Ok(user)
   }

   pub async fn create_repo(payload: RepoPayload, token: &AccessToken) -> crate::Result<models::Repository> {
      const F: &str = "[GithubAPI::create_repo]";

      log!("{F} creating new repo, payload: {payload:#?}");
      let repo: models::Repository = Self::request(Method::PUT, "/user/repos/", &token, Some(payload))
         .await?
         .0;
      log!("{F} new repo created: {}", repo.name);

      Ok(repo)
   }

   pub async fn invite_collaborator(login: &str, token: &AccessToken, owner: &str, repo: &str) -> crate::Result {
      const F: &str = "[GithubAPI::invite_collaborators]";

      log!("{F} about to invite collaborator with login: {login:#?}");
      let path_n_query = format!("/repos/{owner}/{repo}/collaborators/{login}");

      let (res_data, parts) = Self::request::<Value, Value>(Method::PUT, path_n_query, token, None).await?;

      let status = *parts.status();
      let was_successfull = status == reqwest::StatusCode::CREATED || status == reqwest::StatusCode::NO_CONTENT;

      if was_successfull {
         log!("{F} successfully invited {login}, status: {status} response: {res_data:#?}");
         Ok(())
      } else {
         let msg = format!("{F} failed to invite {login} to {owner}/{repo}, status: {status}, response: {res_data:#?}");
         Err(msg)
      }
   }
}

use std::fmt::{Debug, Display};

use octocrab::models;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use serde_json::Value;
use tauri::http::{header, Method};
use tauri_plugin_http::reqwest;

use crate::{auth::AccessToken, log, utils::create_authenticated_octo};

#[derive(Deserialize)]
struct GithubAPIError {
   documentation_url: String,
   message: String,
   status: String,
}

impl Display for GithubAPIError {
   fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
      write!(
         f,
         "Error from github: {}. Status = {}, documentation_url = {}",
         self.message, self.status, self.documentation_url
      )
   }
}

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
      log!("{F} request sent, got response: {res:#?}");

      // create response parts
      let parts = GithubResponseParts {
         status: res.status(),
         headers: res.headers().clone(),
         url: res.url().clone(),
      };
      log!("{F} response parts: {parts:#?}");

      // handle error status codes
      let status_code = parts.status.as_u16();
      if status_code > 399 {
         let err_msg_value = res
            .json::<Value>()
            .await
            .map_err(|e| format!("{F} Could not decode error-response body: {e}",))?;

         if let Ok(err_msg) = serde_json::from_value::<GithubAPIError>(err_msg_value.clone()) {
            log!("{F} received error response: {err_msg}");
            return Err(err_msg.to_string());
         } else {
            log!("{F} received error response: {err_msg_value:#?}");
            return Err(format!(
               "{F} received error response, with status '{status_code}', and data: {err_msg_value:#?}",
            ));
         }
      }

      // log and return reponse data
      let json_data = res
         .json::<R>()
         .await
         .map_err(|e| format!("{F} error reading response body: {e}",))?;
      log!("{F} response json: {json_data:#?}");

      Ok((json_data, parts))
   }

   pub async fn search_users(search: &str, token: &AccessToken) -> crate::Result<Vec<models::Author>> {
      const F: &str = "[GithubAPI::search_users]";

      let octo = create_authenticated_octo(&token.get_token())?;
      log!("{F} searching users that match '{search}'");
      let page = octo
         .search()
         .users(search)
         .per_page(50)
         .send()
         .await
         .map_err(|e| format!("{F} {}", e.to_string()))?;
      let users = page.items;
      log!(
         "{F} returning users found, count: {}. User logins: {}",
         users.len(),
         users.iter().map(|u| u.login.clone()).collect::<Vec<_>>().join(", ")
      );

      Ok(users)
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
      let repo: models::Repository = Self::request(Method::POST, "/user/repos", &token, Some(payload))
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

   pub async fn get_repos(token: &AccessToken, page: Option<u32>) -> crate::Result<Vec<models::Repository>> {
      const F: &str = "[GithubAPI::get_repos]";

      log!("{F} fetching authenticated user's repos");
      let (repos, parts) = Self::request::<Vec<models::Repository>, Value>(
         Method::GET,
         format!("/user/repos?affiliation=owner&per_page=100&page={}", page.unwrap_or(1)),
         &token,
         None,
      )
      .await?;

      log!("{F} reading link header, if any");
      if let Some(link_header) = parts.headers.get("link") {
         let links = link_header
            .to_str()
            .map_err(|e| format!("{F} could not read link headers: {e}"))?
            .split("\",")
            .filter(|link| !link.contains("rel=\"next"))
            .map(|link| link.trim().replace("<", "").replace(">; rel=\"next", ""))
            .collect::<Vec<_>>();

         // links should only contain one rel=next link
         if links.len() == 1 {
            log!("{F} TODO! links vec contains a 'rel=next' link, dont forget to handle!. Links = {links:#?}");
            // let next_page = links
            //    .first()
            //    .expect("links should only contain one rel=next link")
            //    .split("page=")
            //    .last()
            //    .expect("should have page number at the last item in link string after str 'page='")
            //    .parse()
            //    .expect("should be able to covert page str into u32 number");
            // let mut next_page_repos = Self::get_repos(token, Some(next_page)).await?;
            // repos.append(&mut next_page_repos);
         } else {
            log!("{F} links vec did not contain a 'rel=next' link, skipping next page fetches. Links = {links:#?}");
         }
      }

      log!("{F} got {} repos, now returning", repos.len());

      Ok(repos)
   }
}

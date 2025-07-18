use std::{
   fmt::{Debug, Display},
   future::Future,
};

use futures_util::StreamExt;
use octocrab::{models, params::State, Octocrab, Page};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::http::{header, HeaderValue, Method, StatusCode};
use tauri_plugin_http::reqwest;
use urlencoding::encode;

use crate::{
   auth::AccessToken,
   log,
   project::task::NewTaskPayload,
   utils::{create_authenticated_octo, IssueExt},
};

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
   name: Option<String>,
   private: Option<bool>,
}

impl RepoPayload {
   pub fn new(name: Option<String>, private: Option<bool>) -> Self {
      Self { name, private }
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
   fn octo(token: &AccessToken) -> crate::Result<Octocrab> {
      create_authenticated_octo(&token.get_token())
   }

   fn repo_owner(repo: &models::Repository) -> crate::Result<models::Author> {
      const F: &str = "[GithubAPI::repo_owner]";
      repo
         .owner
         .clone()
         .ok_or(format!("{F} '{}' repo somehow does not have an owner", repo.name))
   }

   async fn stream_all<T, S, F>(items_fut: S, octo: &Octocrab, exceptance_cb: F) -> crate::Result<Vec<T>>
   where
      T: DeserializeOwned + Clone + 'static,
      S: Future<Output = Result<Page<T>, octocrab::Error>>,
      F: Fn(T) -> bool,
   {
      const F: &str = "[GithubAPI::stream_all]";

      log!("{F} streaming items");

      let items_stream = items_fut
         .await
         .map_err(|e| format!("{F} Failed to stream items. {e}"))?
         .into_stream(octo);

      let mut items_stream = Box::pin(items_stream);
      log!("{F} placing in local vector");
      let mut all_items = vec![];

      while let Some(response) = items_stream.next().await {
         match response {
            Ok(item) if exceptance_cb(item.clone()) => all_items.push(item),
            Err(e) => return Err(format!("{F} Failed to fetch next item in loop. {e}")),
            _ => {}
         };
      }

      log!("{F} streamed {} items, now returning", all_items.len());
      Ok(all_items)
   }

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
      log!(
         "{F} -- request built successfully, request :-> {} {}?{} | body content-length = {} KBs",
         req.method(),
         req.url().path(),
         req.url().query().unwrap_or(""),
         (req
            .headers()
            .get(header::CONTENT_LENGTH)
            .unwrap_or(&HeaderValue::from_static("0"))
            .to_str()
            .unwrap_or("0")
            .parse::<f64>()
            .unwrap_or(0f64)
            / 1024f64)
            .round(),
      );

      // send request
      let res = reqwest::Client::new()
         .execute(req)
         .await
         .map_err(|e| format!("{F} error sending request, error: {}", e.to_string()))?;

      match res.error_for_status() {
         Ok(res) => {
            // log response
            let content_length = (res
               .headers()
               .get(header::CONTENT_LENGTH)
               .unwrap_or(&HeaderValue::from_static("0"))
               .to_str()
               .unwrap_or("0")
               .parse::<f64>()
               .unwrap_or(0f64)
               / 1024f64)
               .round();

            log!(
               "{F} -- request sent, got response :-> status - {} @ {}?{} | returned {} with content-length = {} KBs",
               res.status(),
               res.url().path(),
               res.url().query().unwrap_or(""),
               res.headers()
                  .get(header::CONTENT_TYPE)
                  .unwrap_or(&HeaderValue::from_static("N/A"))
                  .to_str()
                  .unwrap_or("N/A"),
               content_length,
            );

            // create response parts
            let parts = GithubResponseParts {
               status: res.status(),
               headers: res.headers().clone(),
               url: res.url().clone(),
            };

            // log and return reponse data
            let json_data = res
               .json::<R>()
               .await
               .map_err(|e| format!("{F} error reading response body: {e}",))?;

            Ok((json_data, parts))
         }
         Err(e) => {
            let status_code = e.status().expect(&format!("{F} no error status code found: {e}"));
            return Err(format!("{F} received error response with status '{status_code}', {e}",));
         }
      }
   }

   pub async fn request_with_option_res<R, P>(
      method: Method,
      path_query: impl Into<String>,
      token: &AccessToken,
      payload: Option<P>,
   ) -> crate::Result<(Option<R>, GithubResponseParts)>
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
      log!(
         "{F} -- request built successfully, request :-> {} {}?{} | body content-length = {} KBs",
         req.method(),
         req.url().path(),
         req.url().query().unwrap_or(""),
         (req
            .headers()
            .get(header::CONTENT_LENGTH)
            .unwrap_or(&HeaderValue::from_static("0"))
            .to_str()
            .unwrap_or("0")
            .parse::<f64>()
            .unwrap_or(0f64)
            / 1024f64)
            .round(),
      );

      // send request
      let res = reqwest::Client::new()
         .execute(req)
         .await
         .map_err(|e| format!("{F} error sending request, error: {}", e.to_string()))?;

      match res.error_for_status() {
         Ok(res) => {
            // log response
            let content_length = (res
               .headers()
               .get(header::CONTENT_LENGTH)
               .unwrap_or(&HeaderValue::from_static("0"))
               .to_str()
               .unwrap_or("0")
               .parse::<f64>()
               .unwrap_or(0f64)
               / 1024f64)
               .round();

            log!(
               "{F} -- request sent, got response :-> status - {} @ {}?{} | returned {} with content-length = {} KBs",
               res.status(),
               res.url().path(),
               res.url().query().unwrap_or(""),
               res.headers()
                  .get(header::CONTENT_TYPE)
                  .unwrap_or(&HeaderValue::from_static("N/A"))
                  .to_str()
                  .unwrap_or("N/A"),
               content_length,
            );

            // create response parts
            let parts = GithubResponseParts {
               status: res.status(),
               headers: res.headers().clone(),
               url: res.url().clone(),
            };

            // log and return reponse data if available
            if content_length != 0.0 {
               let json_data = res
                  .json::<R>()
                  .await
                  .map_err(|e| format!("{F} error reading response body: {e}",))?;

               Ok((Some(json_data), parts))
            } else {
               Ok((None, parts))
            }
         }
         Err(e) => {
            let status_code = e.status().expect(&format!("{F} no error status code found: {e}"));
            return Err(format!("{F} received error response with status '{status_code}', {e}",));
         }
      }
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

      log!("{F} building create-request payload");
      let payload = match payload {
         RepoPayload {
            name: Some(name),
            private: Some(private),
         } => json!({"name": name, "private": private}),
         RepoPayload {
            name: Some(name),
            private: None,
         } => json!({"name": name}),
         RepoPayload {
            name: None,
            private: Some(private),
         } => json!({"private": private}),
         RepoPayload {
            name: None,
            private: None,
         } => {
            return Err(format!("{F} cannot create repo with no name nor visibility parameters"));
         }
      };

      log!("{F} creating new repo, payload: {payload:#?}");
      let repo: models::Repository = Self::request(Method::POST, "/user/repos", &token, Some(payload))
         .await?
         .0;
      log!("{F} new repo created: {}", repo.name);

      Ok(repo)
   }

   pub async fn invite_collaborator(
      login: &str,
      token: &AccessToken,
      owner: &str,
      repo: &str,
   ) -> crate::Result<models::Author> {
      const F: &str = "[GithubAPI::invite_collaborators]";

      #[derive(Deserialize, Debug)]
      #[allow(unused)]
      struct InviteResponse {
         id: usize,
         node_id: String,
         repository: models::Repository,
         invitee: models::Author,
         inviter: models::Author,
         permissions: String,
         created_at: String,
         url: String,
         html_url: String,
      }

      log!("{F} about to invite collaborator with login: {login}");
      let path_n_query = format!("/repos/{owner}/{repo}/collaborators/{login}");

      let (invite_response, parts) =
         Self::request::<InviteResponse, Value>(Method::PUT, path_n_query, token, None).await?;

      let status = *parts.status();
      let was_successfull = status == reqwest::StatusCode::CREATED || status == reqwest::StatusCode::NO_CONTENT;

      if was_successfull {
         log!(
            "{F} successfully invited {login}, status: {status} invite-response-invitee: {}-{}",
            invite_response.invitee.login,
            invite_response.id
         );
         Ok(invite_response.invitee)
      } else {
         let msg = format!("{F} failed to invite {login} to {owner}/{repo}, status: {status}",);
         Err(msg)
      }
   }

   pub async fn remove_collaborator(
      login: &str,
      token: &AccessToken,
      owner: &str,
      repo: &models::Repository,
   ) -> crate::Result {
      const F: &str = "[GithubAPI::remove_collaborator]";

      log!("{F} about to remove collaborator with login: {login}");
      let path_n_query = format!("/repos/{owner}/{}/collaborators/{login}", repo.name);

      let (_, parts) = Self::request_with_option_res::<Value, Value>(Method::DELETE, path_n_query, token, None).await?;

      let status = *parts.status();
      let was_successfull = status == reqwest::StatusCode::NO_CONTENT;

      if was_successfull {
         log!("{F} successfully removed {login}, status: {status}",);
         Ok(())
      } else {
         let msg = format!(
            "{F} failed to remove collaborator {login} in {owner}/{}, status: {status}",
            repo.name
         );
         Err(msg)
      }
   }

   pub async fn cancel_any_invite_to(
      login: &str,
      token: &AccessToken,
      owner: &str,
      repo: &models::Repository,
   ) -> crate::Result {
      const F: &str = "[GithubAPI::cancel_any_invite_to]";

      log!("{F} fetching all repo invites");
      let path_n_query = format!("/repos/{owner}/{}/invitations", repo.name);

      #[derive(Deserialize, Debug, Clone)]
      struct TempInvitee {
         login: String,
      }

      #[derive(Deserialize, Debug, Clone)]
      struct TempInvitation {
         id: usize,
         invitee: TempInvitee,
      }

      let (invitations, parts) =
         Self::request::<Vec<TempInvitation>, Value>(Method::GET, path_n_query, token, None).await?;

      if parts.status != StatusCode::OK {
         return Err(format!(
            "{F} failed to retrieve collab invites for {}: status: {}",
            repo.name, parts.status
         ));
      }

      let invitation_id = if let Some(invitation) = invitations.iter().find(|i| i.invitee.login == login) {
         invitation.id
      } else {
         return Err(format!(
            "{F} failed to retrieve collab invite sent to {login}: status: {}",
            parts.status
         ));
      };

      log!("{F} cancelling collab invite '{invitation_id}' sent to: {login}");
      let path_n_query = format!("/repos/{owner}/{}/invitations/{invitation_id}", repo.name);

      let (_, parts) = Self::request_with_option_res::<Value, Value>(Method::DELETE, path_n_query, token, None).await?;

      let status = *parts.status();
      let was_successfull = status == reqwest::StatusCode::NO_CONTENT;

      if was_successfull {
         log!("{F} successfully cancelled invite sent to {login}, status: {status}",);
         Ok(())
      } else {
         let msg = format!(
            "{F} failed to cancel invite sent to {login} in {owner}/{}, status: {status}",
            repo.name
         );
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

   pub async fn get_repo_collaborators(
      repo: &models::Repository,
      token: &AccessToken,
   ) -> crate::Result<Vec<models::Author>> {
      const F: &str = "[GithubAPI::get_repo_collaborators]";

      let octo = create_authenticated_octo(&token.get_token())?;
      log!("{F} fetching collaborators for repo '{}'", repo.name);
      let collaborators = octo
         .repos(
            repo
               .owner
               .clone()
               .expect(&format!("{F} '{}' repo somehow doesnt have owner", repo.name))
               .login,
            repo.name.clone(),
         )
         .list_collaborators()
         .per_page(100)
         .send()
         .await
         .map_err(|e| format!("{F} error fetching list of collaborators: {e}"))?;

      if let Some(_) = collaborators.next {
         log!("{F} TODO! repo has more than 100 collaborators , handle this",);
      }

      let collaborators = collaborators.items.into_iter().map(|c| c.author).collect::<Vec<_>>();
      log!("{F} got {} collaborators, now returning", collaborators.len());

      Ok(collaborators)
   }

   pub async fn get_repo_collab_invitees(
      repo: &models::Repository,
      token: &AccessToken,
   ) -> crate::Result<Vec<models::Author>> {
      const F: &str = "[GithubAPI::get_repo_collab_invitees]";

      log!("{F} fetching collab invites for repo '{}'", repo.name);

      #[derive(Deserialize, Debug)]
      #[allow(unused)]
      struct PendingInviteResponse {
         id: usize,
         node_id: String,
         repository: models::Repository,
         invitee: models::Author,
         inviter: models::Author,
         permissions: String,
         created_at: String,
         url: String,
         html_url: String,
         expired: bool,
      }

      let url = format!(
         "/repos/{}/{}/invitations",
         repo
            .owner
            .clone()
            .expect(&format!("{F} '{}' repo somehow doesnt have owner", repo.name))
            .login,
         repo.name
      );
      let invites = Self::request::<Vec<PendingInviteResponse>, Value>(Method::GET, url, &token, None)
         .await?
         .0
         .into_iter()
         .map(|i| i.invitee)
         .collect::<Vec<_>>();

      log!("{F} got {} collab invites for repo '{}'", invites.len(), repo.name);

      Ok(invites)
   }

   pub async fn get_repo_issues(
      repo: &models::Repository,
      token: &AccessToken,
   ) -> crate::Result<Vec<models::issues::Issue>> {
      const F: &str = "[GithubAPI::get_repo_issues]";

      log!("{F} fetching issues for repo '{}'", repo.name);

      let octo = create_authenticated_octo(&token.get_token())?;
      let owner = repo
         .owner
         .clone()
         .expect(&format!("{F} '{}' repo somehow does not have an owner", repo.name));

      let issues_stream = octo
         .issues(&owner.login, &repo.name)
         .list()
         .state(State::All)
         .send()
         .await
         .map_err(|e| {
            format!(
               "{F} failed to fetch issues at {}/{}. Error: {e}",
               owner.login, repo.name
            )
         })?
         .into_stream(&octo);

      let mut issues_stream = Box::pin(issues_stream);

      log!("{F} streaming issues into local vec",);
      let mut all_issues = vec![];
      while let Some(response) = issues_stream.next().await {
         match response {
            Ok(issue) if !issue.was_deleted() => all_issues.push(issue),
            Err(e) => return Err(format!("{F} failed to fetch next issue in loop: {e}")),
            _ => {}
         };
      }
      log!(
         "{F} done streaming issues into local vec, now returning {} issues",
         all_issues.len()
      );

      Ok(all_issues)
   }

   pub async fn update_repo(
      payload: RepoPayload,
      repo: &models::Repository,
      token: &AccessToken,
   ) -> crate::Result<models::Repository> {
      const F: &str = "[GithubAPI::update_repo]";

      let owner = repo
         .owner
         .clone()
         .expect(&format!("{F} '{}' repo somehow does not have an owner", repo.name))
         .login;

      let path_n_query = format!("/repos/{owner}/{}", repo.name);

      log!("{F} building update request payload");
      let payload = match payload {
         RepoPayload {
            name: Some(name),
            private: Some(private),
         } => json!({"name": name, "private": private}),
         RepoPayload {
            name: Some(name),
            private: None,
         } => json!({"name": name}),
         RepoPayload {
            name: None,
            private: Some(private),
         } => json!({"private": private}),
         RepoPayload {
            name: None,
            private: None,
         } => {
            return Err(format!("{F} cannot update repo with no name nor visibility parameters"));
         }
      };
      log!("{F} sending update request");
      log!("{F} repo update payload is:\n{payload:#?}",);

      let new_repo: models::Repository = Self::request(Method::PATCH, path_n_query, &token, Some(payload))
         .await?
         .0;

      log!(
         "{F} repo updated from {} | {:?} | {} to {} | {:?} | {}!",
         repo.name,
         repo.private,
         repo.id,
         new_repo.name,
         new_repo.private,
         new_repo.id,
      );

      Ok(new_repo)
   }

   pub async fn delete_repo(repo: &models::Repository, token: &AccessToken) -> crate::Result {
      const F: &str = "[GithubAPI::delete_repo]";

      log!("{F} deleting repo '{}'", repo.name);

      let octo = create_authenticated_octo(&token.get_token())?;
      let owner = repo
         .owner
         .clone()
         .expect(&format!("{F} '{}' repo somehow does not have an owner", repo.name));

      octo
         .repos(&owner.login, &repo.name)
         .delete()
         .await
         .map_err(|e| format!("{F} error deleting repo {}. {e}", repo.name))
   }

   pub async fn get_branch_commits(
      repo: &models::Repository,
      branch_name: String,
      token: &AccessToken,
   ) -> crate::Result<Vec<models::repos::RepoCommit>> {
      const F: &str = "[GithubAPI::get_branch_commits]";

      log!("{F} fetching commits exclusively in branch '{branch_name}' (as compared to branch main )",);

      let owner = repo
         .owner
         .clone()
         .expect(&format!("{F} '{}' repo somehow does not have an owner", repo.name));

      #[derive(Deserialize, Debug)]
      struct BranchesComparison {
         commits: Vec<models::repos::RepoCommit>,
      }

      let path_query = format!(
         "/repos/{}/{}/compare/{}...{}",
         owner.login,
         repo.name,
         repo.default_branch.clone().unwrap_or("main".to_string()),
         encode(&branch_name).as_ref()
      );

      log!("{F} fetching exclusive commits @ {path_query} ");

      match Self::request::<BranchesComparison, Value>(Method::GET, &path_query, token, None).await {
         Ok((BranchesComparison { commits }, _)) => Ok(commits),
         Err(e) => {
            log!("{F} failed to fetch exclusive commits @ {path_query}. {e} ");
            if repo.default_branch.is_some() {
               return Err(format!("{F} failed to fetch task activity: {e}"));
            }
            let path_query = format!(
               "/repos/{}/{}/compare/master...{}",
               owner.login,
               repo.name,
               encode(&branch_name).as_ref()
            );

            log!("{F} retrying exclusive commits fetch @ {path_query}");
            let BranchesComparison { commits } =
               Self::request::<BranchesComparison, Value>(Method::GET, path_query, token, None)
                  .await?
                  .0;
            Ok(commits)
         }
      }
   }

   pub async fn create_issue(
      repo: &models::Repository,
      token: &AccessToken,
      payload: NewTaskPayload,
      labels: Option<Vec<String>>,
   ) -> crate::Result<models::issues::Issue> {
      const F: &str = "[GithubAPI::create_issue]";

      log!("{F} creating issue titled '{}' in repo '{}'", payload.title, repo.name);

      let octo = create_authenticated_octo(&token.get_token())?;
      let owner = repo
         .owner
         .clone()
         .expect(&format!("{F} '{}' repo somehow does not have an owner", repo.name));

      let assignees = Some(vec![payload.assignee_login]);
      let labels = if let Some(mut labels) = labels {
         labels.push(format!("{}-priority", payload.priority));
         Some(labels)
      } else {
         Some(vec![format!("{}-priority", payload.priority)])
      };

      let issue = octo
         .issues(&owner.login, &repo.name)
         .create(&payload.title)
         .body::<String>(payload.body)
         .assignees(assignees)
         .labels(labels)
         .send()
         .await
         .map_err(|e| {
            format!(
               "{F} failed to create issue titled '{}' in repo '{}': {e}",
               payload.title, repo.name
            )
         })?;

      log!(
         "{F} created issue titled '{}' with id '{}'. Now returning",
         issue.title,
         issue.id
      );

      Ok(issue)
   }

   pub async fn update_issue(
      old_issue: &models::issues::Issue,
      repo: &models::Repository,
      token: &AccessToken,
      replacement_title: Option<&str>,
      replacement_body: Option<&str>,
      replacement_assignee_login: Option<&[String]>,
      replacement_labels: Option<&[String]>,
      replacement_state: Option<models::IssueState>,
   ) -> crate::Result<models::issues::Issue> {
      const F: &str = "[GithubAPI::update_issue]";

      log!(
         "{F} updating issue number '{}' in repo '{}'",
         old_issue.number,
         repo.name
      );

      let octo = create_authenticated_octo(&token.get_token())?;
      let owner = repo
         .owner
         .clone()
         .expect(&format!("{F} '{}' repo somehow does not have an owner", repo.name));

      let issues = octo.issues(&owner.login, &repo.name);
      let mut updated_issue = issues.update(old_issue.number);

      if let Some(replacement_title) = replacement_title {
         updated_issue = updated_issue.title(replacement_title);
      }

      if let Some(replacement_body) = replacement_body {
         updated_issue = updated_issue.body(replacement_body);
      }

      if let Some(replacement_assignee_login) = replacement_assignee_login {
         updated_issue = updated_issue.assignees(replacement_assignee_login)
      }

      if let Some(replacement_labels) = replacement_labels {
         updated_issue = updated_issue.labels(replacement_labels)
      }

      if let Some(replacement_state) = replacement_state {
         updated_issue = updated_issue.state(replacement_state)
      }

      let updated_issue = updated_issue.send().await.map_err(|e| {
         format!(
            "failed to send update request for issue number {}. {e}",
            old_issue.number
         )
      })?;

      log!(
         "{F} successfully updated issue number '{}' in repo '{}'",
         old_issue.number,
         repo.name
      );

      Ok(updated_issue)
   }

   pub async fn get_updated_repo(
      old_repo: &models::Repository,
      token: &AccessToken,
   ) -> crate::Result<models::Repository> {
      const F: &str = "[GithubAPI::get_updated_repo]";

      log!("{F} fetching updated {} repo", old_repo.name);

      let octo = create_authenticated_octo(&token.get_token())?;

      let owner = old_repo
         .owner
         .clone()
         .expect(&format!("{F} '{}' repo somehow does not have an owner", old_repo.name));

      let updated_repo = octo.repos(&owner.login, &old_repo.name).get().await.map_err(|e| {
         format!(
            "{F} failed to fetch updated {} repo at {}/{}. Error: {e}",
            old_repo.name, owner.login, old_repo.name
         )
      })?;

      Ok(updated_repo)
   }

   pub async fn get_branches(
      repo: &models::Repository,
      token: &AccessToken,
   ) -> crate::Result<Vec<models::repos::Branch>> {
      const F: &str = "[GithubAPI::get_branches]";

      log!("{F} fetching branches for repo {}", repo.name);
      let octo = Self::octo(token)?;
      let owner = Self::repo_owner(repo)?;

      Self::stream_all(
         octo.repos(&owner.login, &repo.name).list_branches().send(),
         &octo,
         |_| true,
      )
      .await
   }
}

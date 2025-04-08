use std::sync::Arc;

use octocrab::models;
use tauri::{AppHandle, Runtime};
use tauri_plugin_store::{Store, StoreExt};

use crate::{auth::AccessToken, github_api, log, utils::dbg_store, STORE_PATH};

fn get_store<R: Runtime>(app: AppHandle<R>) -> crate::Result<Arc<Store<R>>> {
   const F: &str = "[get_store]";

   log!("{F} getting store");
   let store = app.store(STORE_PATH).map_err(|e| format!("{F} {}", e.to_string()))?;

   Ok(store)
}

fn get_token<R: Runtime>(store: &Arc<Store<R>>) -> crate::Result<AccessToken> {
   const F: &str = "[get_token]";

   log!("{F} getting token");
   let token = store.get("token").ok_or(format!("{F} token not found"))?;
   log!("{F} token value: {token:#?}");
   let token = serde_json::from_value::<AccessToken>(token).map_err(|e| e.to_string())?;

   Ok(token)
}

#[tauri::command]
pub async fn fetch_save_and_return_user<R: Runtime>(app: AppHandle<R>) -> crate::Result<models::Author> {
   const F: &str = "[fetch_save_and_return_user]";

   let store = get_store(app)?;
   let token = get_token(&store)?;
   let user = github_api::get_user(&token.get_token()).await?;
   let user_val = serde_json::to_value(&user).map_err(|e| e.to_string())?;
   log!("{F} setting user: {user_val:#?}");
   dbg_store(&store);
   store.set("user", user_val);
   dbg_store(&store);
   log!("{F} returning user");
   Ok(user)
}

#[tauri::command]
pub async fn find_users_matching_query<R: Runtime>(
   app: AppHandle<R>,
   query: String,
) -> crate::Result<Vec<models::Author>> {
   let store = get_store(app)?;
   let token = get_token(&store)?;
   let users_found = github_api::search_users(&query, &token.get_token()).await?;
   Ok(users_found)
}

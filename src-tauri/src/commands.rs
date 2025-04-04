use octocrab::models;
use tauri::{AppHandle, Runtime};
use tauri_plugin_store::StoreExt;

use crate::{auth::AccessToken, github_api, log, utils::dbg_store, STORE_PATH};

#[tauri::command]
pub async fn fetch_save_and_return_user<R: Runtime>(app: AppHandle<R>) -> crate::Result<models::Author> {
   const F: &str = "[fetch_save_and_return_user]";

   log!("{F} getting store");
   let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
   log!("{F} getting token");
   let token = store.get("token").ok_or(format!("{F} token not found"))?;
   log!("{F} token value: {token:#?}");
   let token = serde_json::from_value::<AccessToken>(token).map_err(|e| e.to_string())?;
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
   const F: &str = "[find_users_matching_query]";

   log!("{F} getting store");
   let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
   log!("{F} getting token");
   let token = store.get("token").ok_or(format!("{F} token not found"))?;
   log!("{F} token value: {token:#?}");
   let token = serde_json::from_value::<AccessToken>(token).map_err(|e| e.to_string())?;
   let users_found = github_api::search_users(&query, &token.get_token()).await?;
   Ok(users_found)
}

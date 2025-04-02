use octocrab::models;
use tauri::{AppHandle, Runtime};
use tauri_plugin_store::StoreExt;

use crate::{auth::AccessToken, github_api, log, utils::dbg_store, STORE_PATH};

#[tauri::command]
pub async fn fetch_save_and_return_user<R: Runtime>(app: AppHandle<R>) -> crate::Result<models::Author> {
   log!("getting store");
   let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
   log!("getting token");
   let token = store.get("token").ok_or("token not found".to_string())?;
   log!("token value: {token:#?}");
   let token = serde_json::from_value::<AccessToken>(token).map_err(|e| e.to_string())?;
   let user = github_api::get_user(&token.get_token()).await?;
   let user_val = serde_json::to_value(&user).map_err(|e| e.to_string())?;
   log!("setting user: {user_val:#?}");
   dbg_store(&store);
   store.set("user", user_val);
   dbg_store(&store);
   log!("returning user");
   Ok(user)
}

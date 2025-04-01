use octocrab::models;
use tauri::{http::Method, AppHandle, Runtime, Url};
use tauri_plugin_store::StoreExt;

use crate::{
   auth::AccessToken,
   github_api,
   structs::User,
   utils::{dbg_store, log, user_github_request_async},
   STORE_PATH,
};

#[tauri::command]
pub async fn fetch_save_and_return_user<R: Runtime>(app: AppHandle<R>) -> crate::Result<User> {
   log("getting store");
   let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
   log("getting token");
   let token = store.get("token").ok_or("token not found".to_string())?;
   log(format!("token value: {token:#?}",));
   let token = serde_json::from_value::<AccessToken>(token).map_err(|e| e.to_string())?;

   let url = Url::parse("https://api.github.com/user").map_err(|e| e.to_string())?;
   let method = Method::GET;
   let user = user_github_request_async::<User>(&token, url, method, None).await?;
   let user_val = serde_json::to_value(&user).map_err(|e| e.to_string())?;

   log(format!("setting user: {user_val:#?}",));
   dbg_store(&store);
   store.set("user", user_val);
   dbg_store(&store);
   log("returning user");
   Ok(user)
}

#[tauri::command]
pub async fn get_user<R: Runtime>(app: AppHandle<R>) -> Result<models::Author, String> {
   let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
   if let Some(token) = store.get("token") {
      let token = serde_json::from_value::<AccessToken>(token).map_err(|e| e.to_string())?;
      github_api::get_user(&token.get_token()).await
   } else {
      Err("[get_user] no token found".to_string())
   }
}

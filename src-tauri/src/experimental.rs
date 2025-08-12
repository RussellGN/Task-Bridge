use tauri::{AppHandle, Runtime};
use tauri_plugin_store::StoreExt;

use crate::{error::AppError, log, utils::dbg_store, STORE_PATH};

#[tauri::command]
pub async fn clear_store<R: Runtime>(app: AppHandle<R>) -> crate::Result {
   const F: &str = "[clear_store]";
   log!("{F} getting store");
   let store = app
      .store(STORE_PATH)
      .map_err(|e| AppError::unknown(&e.to_string(), F, None))?;
   log!("{F} clearing store");
   store.reset();
   dbg_store(&store);
   Ok(())
}

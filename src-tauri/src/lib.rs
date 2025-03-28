use tauri::{AppHandle, Manager};
use utils::log;

mod auth;
mod commands;
mod setup;
mod structs;
mod utils;

pub const STORE_PATH: &str = "store.json";

fn initialize_single_instance(app: &AppHandle, _args: Vec<String>, _cwd: String) {
   if let Some(window) = app.get_webview_window("main") {
      if let Err(e) = window.set_focus() {
         log(format!(
            "could not focus main window after cancelling launch of additional window instance: {e}"
         ));
      };
   }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
   tauri::Builder::default()
      .plugin(tauri_plugin_http::init())
      .plugin(tauri_plugin_single_instance::init(initialize_single_instance))
      .plugin(tauri_plugin_deep_link::init())
      .plugin(tauri_plugin_store::Builder::new().build())
      .plugin(tauri_plugin_opener::init())
      .setup(setup::setup)
      .invoke_handler(tauri::generate_handler![commands::fetch_save_and_return_user])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}

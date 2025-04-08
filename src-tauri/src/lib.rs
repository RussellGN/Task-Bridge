mod auth;
mod commands;
mod experimental;
mod github_api;
mod project;
mod setup;
mod utils;

use setup::init_tauri_plugin_single_instance;

pub const STORE_PATH: &str = "store.json";
pub const ENV_STR: &'static str = include_str!("../.env");
pub const TEAM_LOGINS_SEPERATOR: &str = "-;;-";

pub type Result<T = ()> = std::result::Result<T, String>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
   tauri::Builder::default()
      .plugin(tauri_plugin_http::init())
      .plugin(tauri_plugin_single_instance::init(init_tauri_plugin_single_instance))
      .plugin(tauri_plugin_deep_link::init())
      .plugin(tauri_plugin_store::Builder::new().build())
      .plugin(tauri_plugin_opener::init())
      .setup(setup::setup)
      .invoke_handler(tauri::generate_handler![
         commands::fetch_save_and_return_user,
         commands::find_users_matching_query,
         commands::create_project,
         experimental::clear_store
      ])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}

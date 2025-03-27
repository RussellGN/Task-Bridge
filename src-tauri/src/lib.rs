mod commands;
mod setup;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
   tauri::Builder::default()
      .plugin(tauri_plugin_single_instance::init(|_, _, _| {}))
      .plugin(tauri_plugin_deep_link::init())
      .plugin(tauri_plugin_store::Builder::new().build())
      .plugin(tauri_plugin_opener::init())
      .setup(setup::setup)
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}

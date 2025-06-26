// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
   if cfg!(debug_assertions) {
      dotenvy::dotenv().ok();
   }
   task_bridge_lib::run()
}

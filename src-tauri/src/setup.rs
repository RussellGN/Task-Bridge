use std::error::Error;

use tauri::{App, AppHandle, Manager, Runtime};
use tauri_plugin_deep_link::DeepLinkExt;

use crate::{auth::proceed_to_auth, log, utils::get_env_vars};

const APP_URL_SCHEME: &str = "task-bridge";

pub fn setup(app: &mut App<impl Runtime>) -> Result<(), Box<dyn Error>> {
   if cfg!(debug_assertions) {
      setup_dev_plumbing(app)?;
   }
   setup_deep_linking(app)?;
   Ok(())
}

pub fn setup_dev_plumbing(app: &mut App<impl Runtime>) -> Result<(), Box<dyn Error>> {
   const F: &str = "[setup_dev_plumbing]";

   // use tauri_plugin_store::StoreExt;
   // log!("{F} clearing store");
   // app.store("store.json").unwrap().clear();

   if let Some(main_webview) = app.get_webview_window("main") {
      let _ = main_webview.set_size(tauri::Size::Logical(tauri::LogicalSize {
         width: 1120.0,
         height: 635.0,
      }));
      main_webview.open_devtools();
      let _ = main_webview.set_position(tauri::Position::Logical(tauri::LogicalPosition { x: 0.0, y: 0.0 }));
   }

   log!("{F} {:#?}", get_env_vars());

   Ok(())
}

fn setup_deep_linking(app: &mut App<impl Runtime>) -> Result<(), Box<dyn Error>> {
   const F: &str = "[setup_deep_linking]";

   let deep_link = app.deep_link();

   match deep_link.is_registered(APP_URL_SCHEME) {
      Err(e) => {
         log!("{F} could not confirm if app is registered to handle '{APP_URL_SCHEME}' urls. Error: {e}");

         log!("{F} attempting to register scheme: {APP_URL_SCHEME}");
         match deep_link.register(APP_URL_SCHEME) {
            Ok(_) => {
               log!("{F} '{APP_URL_SCHEME}' scheme registration was successfull");
               log!(
                  "{F} {APP_URL_SCHEME} is_registered? {}",
                  deep_link.is_registered("task-bridge").map_err(|e| e.to_string())?
               );
            }
            Err(e) => {
               log!("{F} '{APP_URL_SCHEME}' scheme registration failed. Error: {e}");
               return Err(Box::new(e));
            }
         }
      }

      Ok(is_reg) => {
         log!("{F} is app registered to handle 'task-bridge' urls? {is_reg}");
      }
   }

   let app_handle = app.handle().clone();

   deep_link.on_open_url(move |e| {
      const F: &str = "[on_open_url]";

      let urls = e.urls();
      log!("{F} deep link hit. Urls: {urls:#?}");

      if !urls.is_empty() {
         match urls.first() {
            Some(url) => match url.path() {
               "/proceed-to-auth" => {
                  if let Err(e) = proceed_to_auth(url, &app_handle) {
                     log!("{F} error handling deep-link-hit: {e}");
                  }
               }
               path => log!("{F} no handler set for deep link path '{path}', url = {url:#?}"),
            },
            None => log!("{F} could not retrieve the first url"),
         }
      };
   });

   // this should not be possible, due to single instance plugin]
   if let Ok(Some(urls)) = deep_link.get_current() {
      log!(
         "{F} this should not be possible, due to single instance plugin: app loaded by deep link with urls: {urls:#?}"
      );
   }

   Ok(())
}

pub fn init_tauri_plugin_single_instance(app: &AppHandle, _args: Vec<String>, _cwd: String) {
   const F: &str = "[init_tauri_plugin_single_instance]";

   if let Some(window) = app.get_webview_window("main") {
      if let Err(e) = window.set_focus() {
         log!("{F} could not focus main window after cancelling launch of additional window instance: {e}");
      };
   }
}

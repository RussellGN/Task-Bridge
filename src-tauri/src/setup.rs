use std::error::Error;

use tauri::{App, AppHandle, Manager, Runtime};
use tauri_plugin_deep_link::DeepLinkExt;

use crate::{
   auth::proceed_to_auth,
   utils::{get_env_vars, log},
};

const APP_URL_SCHEME: &str = "task-bridge";

pub fn setup(app: &mut App<impl Runtime>) -> Result<(), Box<dyn Error>> {
   // use tauri_plugin_store::StoreExt;
   // log("clearing store");
   // app.store("store.json").unwrap().clear();

   println!("{:#?}", get_env_vars());
   setup_deep_linking(app)?;

   Ok(())
}

fn setup_deep_linking(app: &mut App<impl Runtime>) -> Result<(), Box<dyn Error>> {
   let deep_link = app.deep_link();

   match deep_link.is_registered(APP_URL_SCHEME) {
      Err(e) => {
         log(format!(
            "[setup_deep_linking] could not confirm if app is registered to handle '{APP_URL_SCHEME}' urls. Error: {e}"
         ));

         log(format!(
            "[setup_deep_linking] attempting to register scheme: {APP_URL_SCHEME}"
         ));
         match deep_link.register(APP_URL_SCHEME) {
            Ok(_) => {
               log(format!(
                  "[setup_deep_linking] '{APP_URL_SCHEME}' scheme registration was successfull"
               ));
               log(format!(
                  "[setup_deep_linking] {APP_URL_SCHEME} is_registered? {}",
                  deep_link.is_registered("task-bridge").map_err(|e| e.to_string())?
               ));
            }
            Err(e) => {
               log(format!(
                  "[setup_deep_linking] '{APP_URL_SCHEME}' scheme registration failed. Error: {e}"
               ));
               return Err(Box::new(e));
            }
         }
      }

      Ok(is_reg) => {
         log(format!("is app registered to handle 'task-bridge' urls? {is_reg}"));
      }
   }

   let app_handle = app.handle().clone();

   deep_link.on_open_url(move |e| {
      let urls = e.urls();
      log(format!("[on_open_url] deep link hit. Urls: {urls:#?}",));

      if !urls.is_empty() {
         match urls.first() {
            Some(url) => match url.path() {
               "/proceed-to-auth" => {
                  if let Err(e) = proceed_to_auth(url, &app_handle) {
                     log(format!("[on_open_url] error handling deep-link-hit: {e}"));
                  }
               }
               path => log(format!(
                  "[on_open_url] no handler set for deep link path '{path}', url = {url:#?}"
               )),
            },
            None => log("[on_open_url] could not retrieve the first url"),
         }
      };
   });

   // this should not be possible, due to single instance plugin]
   if let Ok(Some(urls)) = deep_link.get_current() {
      log(format!(
         "[setup_deep_linking] this should not be possible, due to single instance plugin: app loaded by deep link with urls: {urls:#?}"
      ));
   }

   Ok(())
}

pub fn init_tauri_plugin_single_instance(app: &AppHandle, _args: Vec<String>, _cwd: String) {
   if let Some(window) = app.get_webview_window("main") {
      if let Err(e) = window.set_focus() {
         log(format!(
            "[init_tauri_plugin_single_instance] could not focus main window after cancelling launch of additional window instance: {e}"
         ));
      };
   }
}

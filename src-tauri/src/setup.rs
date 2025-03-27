use std::error::Error;

use tauri::{App, Runtime};
use tauri_plugin_deep_link::DeepLinkExt;

use crate::{auth::handle_auth_setup, utils::log};

pub fn setup(app: &mut App<impl Runtime>) -> Result<(), Box<dyn Error>> {
   setup_deep_linking(app)
}

fn setup_deep_linking(app: &mut App<impl Runtime>) -> Result<(), Box<dyn Error>> {
   let deep_link = app.deep_link();

   match deep_link.is_registered("task-bridge") {
      Err(e) => {
         log(format!(
            "could not confirm if app is registered to handle 'task-bridge' urls. Error: {e}"
         ));
         log("attempting to register");

         match deep_link.register_all() {
            Ok(_) => {
               log("registration as 'task-bridge' handler successfull");
               log(format!(
                  "[deep_link.is_registered] {:#?}",
                  deep_link.is_registered("task-bridge")
               ));
            }
            Err(e) => log(format!(
               "failed to register app to handle 'task-bridge' urls. Error: {e}"
            )),
         }
      }

      Ok(is_reg) => {
         log(format!("is app registered to handle 'task-bridge' urls? {is_reg}"));
      }
   }

   let app_handle = app.handle().clone();

   deep_link.on_open_url(move |e| {
      let urls = e.urls();
      log(format!("deep link hit [on_open_url]. Urls: {urls:#?}",));

      if !urls.is_empty() {
         let url = urls.first().unwrap();
         if let Err(e) = handle_auth_setup(url, &app_handle) {
            log(format!("error handling deep link hit: {e}"));
         }
      };
   });

   // this should not be possible, due to single instance plugin]
   {
      if let Ok(Some(urls)) = deep_link.get_current() {
         log(format!(
            "[this should not be possible, due to single instance plugin] app loaded by deep link, urls: {urls:#?}"
         ));
      }
   }

   Ok(())
}

use std::error::Error;

use tauri::{App, Runtime};
use tauri_plugin_deep_link::DeepLinkExt;

use crate::utils::log;

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

   deep_link.on_open_url(|e| {
      log(format!("deep link hit [on_open_url]. Urls: {:#?}", e.urls()));
   });

   if let Ok(Some(urls)) = deep_link.get_current() {
      log(format!("app loaded by deep link, urls: {urls:#?}"));
   }

   Ok(())
}

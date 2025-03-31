use octocrab::{models, OctocrabBuilder};

use crate::utils::log;

pub async fn get_user(token: &str) -> crate::Result<models::Author> {
   log(format!("[get_user] creating octo with authentication"));
   let octo = OctocrabBuilder::new()
      .user_access_token(token)
      .build()
      .map_err(|e| e.to_string())?;

   log(format!("[get_user] fetching user"));
   let user = octo.current().user().await.map_err(|e| e.to_string())?;
   log(format!("[get_user] now returning user response: {user:#?}"));

   Ok(user)
}

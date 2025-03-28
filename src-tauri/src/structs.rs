use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Default, Debug)]
pub struct User {
   login: String,
   avatar_url: String,
   email: Option<String>,
}

use serde::Serialize;
use ts_rs::TS;

pub type Result<T = ()> = std::result::Result<T, AppError>;

#[derive(Debug, Serialize, TS)]
#[ts(export)]
#[ts(export_to = "../../src/bindings/index.ts")]
pub struct AppErrorContext {
   message: String,
   /// fully qualified name of the function raising the error
   /// # Example
   /// ```
   /// "crate::utils::get_store"
   /// ```
   origin: String,
}

impl AppErrorContext {
   fn new<T: Into<String>>(message: T, origin: T) -> Self {
      Self {
         message: message.into(),
         origin: origin.into(),
      }
   }
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
#[ts(export_to = "../../src/bindings/index.ts")]
pub enum AppError {
   UnknownError(AppErrorContext),
}

impl std::error::Error for AppError {}

impl std::fmt::Display for AppError {
   fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
      match self {
         AppError::UnknownError(cxt) => write!(f, "Unknown Error - {}", cxt.message),
      }
   }
}

pub struct AppErrorAPI;

impl AppErrorAPI {
   pub fn unknown(msg: &str, org: &str) -> AppError {
      AppError::UnknownError(AppErrorContext::new(msg, org))
   }
}

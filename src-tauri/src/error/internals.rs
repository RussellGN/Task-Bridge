use std::{error::Error as StdError, fmt};

use serde::Serialize;
use ts_rs::TS;

pub(super) type DynErrorOption = Option<Box<dyn StdError + Send>>;

#[derive(Debug, Serialize, TS)]
#[ts(export)]
#[ts(export_to = "../../src/bindings/index.ts")]
pub(super) struct _AppErrorContext {
   message: String,
   /// fully qualified name of the function raising the error
   /// # Example
   /// ```
   /// "crate::utils::get_store"
   /// ```
   origin: String,
   #[ts(skip)]
   #[serde(skip)]
   inner_err: DynErrorOption,
}

impl _AppErrorContext {
   pub(super) fn new<T: Into<String>>(message: T, origin: T, inner_err: DynErrorOption) -> Self {
      Self {
         message: message.into(),
         origin: origin.into(),
         inner_err,
      }
   }
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
#[ts(export_to = "../../src/bindings/index.ts")]
pub enum _AppError {
   #[allow(private_interfaces)]
   UnknownError(_AppErrorContext),
}

impl StdError for _AppError {}

impl fmt::Display for _AppError {
   fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
      match self {
         _AppError::UnknownError(cxt) => write!(f, "Unknown Error - {}", cxt.message),
      }
   }
}

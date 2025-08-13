use std::{
   error::Error as StdError,
   fmt::{self},
   sync::Arc,
};

use serde::Serialize;
use tauri::Runtime;
use tauri_plugin_store::Store;
use ts_rs::TS;

use crate::logging::{Log, LogType};

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

pub async fn log_err_and_relay<R, T, F>(cb: F, store: Arc<Store<R>>) -> crate::Result<T>
where
   R: Runtime,
   T: Serialize,
   F: AsyncFnOnce() -> crate::Result<T>,
{
   match cb().await {
      Ok(res) => Ok(res),
      Err(e) => {
         if let Some(context) = e.get_context() {
            let body = format!("This error originated in {}", context.origin);
            let context_str = Some(format!("{:#?}", context.inner_err));
            let log = Log::new(LogType::ERROR, context.message.clone(), Some(body), context_str);
            log.persist(Some(store)).await;
         }
         Err(e)
      }
   }
}

#[derive(Debug, Serialize, TS)]
#[ts(export)]
#[ts(export_to = "../../src/bindings/index.ts")]
#[ts(rename_all = "kebab-case")]
#[serde(rename_all = "kebab-case")]
pub enum _AppError {
   #[allow(private_interfaces)]
   UnknownError(_AppErrorContext),
}

impl _AppError {
   fn get_context(&self) -> Option<&_AppErrorContext> {
      match self {
         Self::UnknownError(c) => Some(c),
      }
   }
}

impl StdError for _AppError {}

impl fmt::Display for _AppError {
   fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
      match self {
         _AppError::UnknownError(cxt) => write!(f, "Unknown Error - {}", cxt.message),
      }
   }
}

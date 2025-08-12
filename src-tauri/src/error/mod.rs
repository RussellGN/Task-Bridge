mod internals;

use internals::{DynErrorOption, _AppError, _AppErrorContext};

pub type Result<T = ()> = std::result::Result<T, _AppError>;

pub struct AppError;

impl AppError {
   pub fn unknown(msg: &str, org: &str, err: DynErrorOption) -> _AppError {
      _AppError::UnknownError(_AppErrorContext::new(msg, org, err))
   }
}

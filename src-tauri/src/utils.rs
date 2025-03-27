use tauri::Runtime;
use tauri_plugin_store::Store;

pub fn log(msg: impl Into<String>) {
   println!("{}", msg.into());
}

pub fn dbg_store(store: &Store<impl Runtime>) {
   let store = store.entries();

   println!("-------------store debug--------------");
   println!("{store:#?}");
   println!("--------------------------------------");
}

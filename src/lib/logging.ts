import { DEFAULT_TOAST_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { truncateStr } from "./utils";

export function alertError<T>(e: T, description?: string) {
   let errorMsg = e instanceof Error && e.message ? e.message : String(e);
   errorMsg = trimFunctionNameFromLog(errorMsg);
   toast.error(truncateStr(errorMsg, 200), {
      ...DEFAULT_TOAST_OPTIONS,
      description: truncateStr(description || "", 400),
   });
   persistOrConsoleLog("ERROR", errorMsg, description);
}

export function alertInfo<T>(info: T, description?: string) {
   let infoMsg = String(info);
   infoMsg = infoMsg.replace(/\[.*?\]/g, "").trim(); // remove [<func_name>]
   toast(infoMsg, { ...DEFAULT_TOAST_OPTIONS, description });
   persistOrConsoleLog("INFO", infoMsg, description);
}

export function alertSuccess<T>(title: T, description?: string) {
   let successMsg = String(title);
   successMsg = successMsg.replace(/\[.*?\]/g, "").trim(); // remove [<func_name>]
   toast.success(successMsg, { ...DEFAULT_TOAST_OPTIONS, description });
   persistOrConsoleLog("SUCCESS", successMsg, description);
}

export function dbg(...args: unknown[]) {
   persistOrConsoleLog("INFO", "debug", undefined, args);
}

export function logError(...args: unknown[]) {
   persistOrConsoleLog("ERROR", "error", undefined, args);
}

export function logInfo(...args: unknown[]) {
   persistOrConsoleLog("INFO", "info", undefined, args);
}

export function trimFunctionNameFromLog(log: string) {
   log = log
      .trim()
      .replace(/\[.*?\]/g, "")
      .trim(); // remove [<func_name>]
   return log;
}

function persistOrConsoleLog(log_type: "INFO" | "ERROR" | "SUCCESS", title: string, body?: string, context?: unknown) {
   const log = {
      log_type,
      title,
      body,
      context: JSON.stringify(context),
   };

   if (import.meta.env.PROD) invoke("persist_log", { log });
   else console.log(log);
}

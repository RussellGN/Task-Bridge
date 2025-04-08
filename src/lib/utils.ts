import { STORE_PATH } from "@/lib/constants";
import { load } from "@tauri-apps/plugin-store";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function random_global_auth_keyword() {
   return "key_t_b_auth";
}

export function alertError<T>(e: T) {
   logError(e);
   let errorMsg = e instanceof Error && e.message ? e.message : String(e);
   errorMsg = errorMsg.replace(/\[.*?\]/g, "").trim(); // remove [<func_name>]
   toast.error(errorMsg);
}

export function alertInfo<T>(info: T) {
   logInfo(info);
   let infoMsg = String(info);
   infoMsg = infoMsg.replace(/\[.*?\]/g, "").trim(); // remove [<func_name>]
   toast(infoMsg);
}

export function alertSuccess<T>(info: T) {
   logInfo(info);
   let infoMsg = String(info);
   infoMsg = infoMsg.replace(/\[.*?\]/g, "").trim(); // remove [<func_name>]
   toast.success(infoMsg);
}

export function dbg(...args: unknown[]) {
   console.log(...args);
}

export function logError(...args: unknown[]) {
   console.error(...args);
}

export function logInfo(...args: unknown[]) {
   console.log(...args);
}

export function wait(seconds: number) {
   return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function checkAuth() {
   const store = await load(STORE_PATH);
   const isAuthenticated = await store.has("token");
   return isAuthenticated;
}

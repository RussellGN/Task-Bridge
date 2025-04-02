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

export function logError<T>(e: T) {
   console.error(e);
   if (import.meta.env.DEV) {
      toast(String(e));
   }
}

export function logInfo<T>(info: T) {
   console.log(info);
   if (import.meta.env.DEV) {
      toast(String(info));
   }
}

export function wait(seconds: number) {
   return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function checkAuth() {
   const store = await load(STORE_PATH);
   const isAuthenticated = await store.has("token");
   return isAuthenticated;
}

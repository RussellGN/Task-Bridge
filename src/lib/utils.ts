import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function random_global_auth_keyword() {
   return "key_t_b_auth";
}

export function logError(e: Error) {
   console.error(e);
}

export function logInfo<T>(info: T) {
   logInfo(info);
}

export function wait(seconds: number) {
   return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

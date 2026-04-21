import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
   base: process.env.GITHUB_ACTIONS ? "/Task-Bridge/" : "/",
   plugins: [tailwindcss()],
});

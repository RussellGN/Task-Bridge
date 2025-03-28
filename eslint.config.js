import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default defineConfig([
   { files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
   { files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
   { files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
   tseslint.configs.recommended,
   pluginReact.configs.flat.recommended,
]);

import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default defineConfig([
   { ignores: ["src-tauri/"] },
   { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
   { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
   { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
   tseslint.configs.recommended,
   pluginReact.configs.flat.recommended,
   {
      settings: {
         react: {
            version: "detect",
            jsxRuntime: "automatic",
         },
      },
      rules: {
         "react/react-in-jsx-scope": "off",
      },
   },
]);

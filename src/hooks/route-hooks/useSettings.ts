import { alertSuccess } from "@/lib/utils";
import { Settings } from "@/types/interfaces";
import React from "react";

export default function useSettings() {
   function patchSettings(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget)) as unknown as Settings;
      console.log("Patching settings with data:", data);
      alertSuccess("Settings saved!");
   }

   return { patchSettings, loading: false };
}

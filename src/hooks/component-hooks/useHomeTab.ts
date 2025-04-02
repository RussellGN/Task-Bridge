import { logError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";

export default function useHomeTab() {
   const [appVersion, setAppVersion] = useState("");

   useEffect(() => {
      getVersion()
         .then(setAppVersion)
         .catch((e) => logError("[useHomeTab] Error fetching app version: " + JSON.stringify(e)));
   }, []);

   return { appVersion };
}

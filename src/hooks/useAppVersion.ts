import { logError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";

export default function useAppVersion() {
   const [appVersion, setAppVersion] = useState("");

   useEffect(() => {
      getVersion()
         .then(setAppVersion)
         .catch((e) => logError("[useAppVersion] Error fetching app version: " + JSON.stringify(e)));
   }, []);

   return appVersion;
}

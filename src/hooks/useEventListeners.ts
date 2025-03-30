import { useEffect } from "react";
import { useNavigate } from "react-router";
import { logError, logInfo } from "@/lib/utils";
import { once } from "@tauri-apps/api/event";

export default function useEventListeners() {
   const navigate = useNavigate();

   useEffect(() => {
      logInfo("[useEventListeners] effect run at: " + new Date().toISOString());
      let unlisten: (() => void) | undefined;

      (async () => {
         try {
            unlisten = await once("auth-setup-complete", (e) => {
               logInfo("[useEventListeners] auth-setup-complete, event: " + e);

               if (unlisten) {
                  logInfo("[useEventListeners] inside auth event cb! unlisten was set, calling it!");
                  unlisten();
                  unlisten = undefined;
               } else logInfo("[useEventListeners] inside auth event cb! unlisten was not set!");

               navigate("/home");
            });
         } catch (e) {
            logError(e);
         }
      })();

      logInfo("[useEventListeners] unlisten: " + unlisten);

      return () => {
         if (unlisten) {
            logInfo("[useEventListeners] unlisten was set, calling it!");
            unlisten();
         } else logInfo("[useEventListeners] unlisten was not set!");
      };
   }, []);
}

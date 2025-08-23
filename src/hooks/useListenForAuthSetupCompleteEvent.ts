import { useEffect } from "react";
import { useNavigate } from "react-router";
import { logError, logInfo } from "@/lib/logging";
import { checkAuth } from "@/lib/utils";
import { once } from "@tauri-apps/api/event";

export default function useListenForAuthSetupCompleteEvent() {
   const navigate = useNavigate();

   useEffect(() => {
      let unlisten: (() => void) | undefined;

      (async () => {
         try {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
               logInfo("[useListenForAuthSetupCompleteEvent] already authenticated, no further action");
               return;
            }

            unlisten = await once("auth-setup-complete", (e) => {
               logInfo("[useListenForAuthSetupCompleteEvent] Auth setup complete!");
               logInfo("[useListenForAuthSetupCompleteEvent] auth-setup-complete, event: " + JSON.stringify(e));

               if (unlisten) {
                  logInfo("[useListenForAuthSetupCompleteEvent] inside auth event cb! unlisten was set, calling it!");
                  unlisten();
                  unlisten = undefined;
               } else logInfo("[useListenForAuthSetupCompleteEvent] inside auth event cb! unlisten was not set!");

               navigate("/home");
            });
         } catch (e) {
            logError(e);
         }
      })();

      return () => {
         if (unlisten) {
            logInfo("[useListenForAuthSetupCompleteEvent] unlisten was set, calling it!");
            unlisten();
         } else logInfo("[useListenForAuthSetupCompleteEvent] unlisten was not set!");
      };
   }, []);
}

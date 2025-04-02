import { useEffect } from "react";
import { useNavigate } from "react-router";
import { checkAuth, logError, logInfo } from "@/lib/utils";
import { once } from "@tauri-apps/api/event";

export default function useListenForAuthSetupCompleteEvent() {
   const navigate = useNavigate();

   useEffect(() => {
      logInfo("[useListenForAuthSetupCompleteEvent] effect run at: " + new Date().toISOString());
      let unlisten: (() => void) | undefined;

      (async () => {
         try {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
               logInfo("[useListenForAuthSetupCompleteEvent] already authenticated, no further action");
               return;
            }

            unlisten = await once("auth-setup-complete", (e) => {
               logInfo("[useListenForAuthSetupCompleteEvent] auth-setup-complete, event: " + e);

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

      logInfo("[useListenForAuthSetupCompleteEvent] unlisten: " + unlisten);

      return () => {
         if (unlisten) {
            logInfo("[useListenForAuthSetupCompleteEvent] unlisten was set, calling it!");
            unlisten();
         } else logInfo("[useListenForAuthSetupCompleteEvent] unlisten was not set!");
      };
   }, []);
}

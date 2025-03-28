import { useEffect } from "react";
import { useNavigate } from "react-router";
import { logError, logInfo } from "@/lib/utils";
import { once } from "@tauri-apps/api/event";

export default function useEventListeners() {
   const navigate = useNavigate();
   logInfo("in useEventListeners");

   useEffect(() => {
      logInfo("[useEventListeners] useEffect run, id: " + Date.now());

      let unlisten: (() => void) | undefined;

      (async () => {
         try {
            unlisten = await once("auth-setup-complete", (e) => {
               logInfo("auth-setup-complete " + e);
               navigate("/home");

               if (unlisten) {
                  logInfo("[useEventListeners] inside auth event cb! unlisten was set, calling it!");
                  unlisten();
                  unlisten = undefined;
               } else logInfo("[useEventListeners]  inside auth event cb! unlisten was not set!");
            });
         } catch (error) {
            if (error instanceof Error) {
               logError(error);
            } else {
               logError(new Error("Error is not an instance of Error. Error: " + error));
            }
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

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { logError } from "@/lib/utils";
import { once } from "@tauri-apps/api/event";

export default function useEventListeners() {
   const navigate = useNavigate();
   console.log("in useEventListeners");

   useEffect(() => {
      console.log("[useEventListeners] useEffect run, id: ", Date.now());

      let unlisten: (() => void) | undefined;

      (async () => {
         try {
            unlisten = await once("auth-setup-complete", (e) => {
               console.log("auth-setup-complete", e);
               navigate("/home");

               if (unlisten) {
                  console.log("[useEventListeners] inside auth event cb! unlisten was set, calling it!");
                  unlisten();
                  unlisten = undefined;
               } else console.log("[useEventListeners]  inside auth event cb! unlisten was not set!");
            });
         } catch (error) {
            if (error instanceof Error) {
               logError(error);
            } else {
               logError(new Error("Error is not an instance of Error. Error: " + error));
            }
         }
      })();

      console.log("[useEventListeners] unlisten: ", unlisten);

      return () => {
         if (unlisten) {
            console.log("[useEventListeners] unlisten was set, calling it!");
            unlisten();
         } else console.log("[useEventListeners] unlisten was not set!");
      };
   }, []);
}

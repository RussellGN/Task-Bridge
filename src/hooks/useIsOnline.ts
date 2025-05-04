import { alertError, alertSuccess } from "@/lib/utils";
import React from "react";

export default function useIsOnline() {
   const [isOnline, setIsOnline] = React.useState(window.navigator.onLine);

   React.useEffect(() => {
      function goOnline() {
         alertSuccess("Back Online!");
         setIsOnline(true);
      }
      function goOffline() {
         alertError("You're Offline!", "Some features may not work.");
         setIsOnline(false);
      }

      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);

      return () => {
         window.removeEventListener("online", goOnline);
         window.removeEventListener("offline", goOffline);
      };
   });

   return isOnline;
}

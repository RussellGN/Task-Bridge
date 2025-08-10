import useIsOnline from "@/hooks/useIsOnline";
import { alertError } from "@/lib/logging";
import React, { PropsWithChildren, useContext } from "react";

const connectivityContext = React.createContext(true);

export default function ConnectionStatusProvider({ children }: PropsWithChildren) {
   const isOnline = useIsOnline();
   return <connectivityContext.Provider value={isOnline}>{children}</connectivityContext.Provider>;
}

export function useConnectionStatus() {
   const isOnline = useContext(connectivityContext);

   function doIfOnline(cb: () => void, offlineErrMsg: string, description?: string) {
      if (!isOnline) {
         alertError(offlineErrMsg, description || "Please check your internet connection and try again.");
         return;
      } else cb();
   }

   function doIfOnlineAsync(cb: () => Promise<void>, offlineErrMsg: string, description?: string) {
      return new Promise<void>((resolve) => {
         if (!isOnline) {
            alertError(offlineErrMsg, description || "Please check your internet connection and try again.");
            resolve();
         } else cb().then(resolve);
      });
   }

   return { isOnline, doIfOnline, doIfOnlineAsync };
}

import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import { STORE_PATH } from "@/lib/constants";
import { logError, logInfo } from "@/lib/utils";
import { UserInterface } from "@/lib/interfaces";
import { invoke } from "@tauri-apps/api/core";

export default function useHome() {
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | string | undefined>(undefined);
   const [user, setUser] = useState<UserInterface | undefined>(undefined);

   useEffect(() => {
      load(STORE_PATH)
         .then((store) => {
            store.get<UserInterface>("user").then((user) => {
               if (!user) {
                  logInfo("User not found, fetching from backend");
                  invoke<UserInterface>("fetch_save_and_return_user")
                     .then((user) => {
                        logInfo(user);
                        setUser(user);
                     })
                     .catch((e) => {
                        logError(e);
                        setError(e);
                     });
               } else {
                  // user is somehow a string, so we need to convert it to UserInterface object
                  const userObj = JSON.parse(String(user)) as UserInterface;
                  setUser(userObj);
               }
            });
         })
         .catch((e) => {
            logError(e);
            setError(e);
         })
         .finally(() => {
            setLoading(false);
         });
   }, []);

   logInfo(user);

   return { loading, user, error };
}

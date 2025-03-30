import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import { STORE_PATH } from "@/lib/constants";
import { logInfo } from "@/lib/utils";
import { UserInterface } from "@/lib/interfaces";
import { invoke } from "@tauri-apps/api/core";

export default function useHome() {
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | string | undefined>(undefined);
   const [user, setUser] = useState<UserInterface | undefined>(undefined);

   useEffect(() => {
      setLoading(true);
      setError(undefined);

      void (async () => {
         try {
            const store = await load(STORE_PATH);
            let userObj = await store.get<UserInterface>("user");

            if (!userObj) {
               logInfo("User not found, fetching from backend");
               userObj = await invoke<UserInterface>("fetch_save_and_return_user");
            } else if (typeof userObj === "string") userObj = JSON.parse(userObj) as UserInterface;

            setUser(userObj);
         } catch (e) {
            setError(e as typeof error);
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   logInfo(user);

   return { loading, user, error };
}

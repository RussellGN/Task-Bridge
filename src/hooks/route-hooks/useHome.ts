import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import { STORE_PATH } from "@/lib/constants";
import { logError } from "@/lib/utils";
import { AccessToken } from "@/lib/types";

export default function useHome() {
   const [loading, setLoading] = useState(true);
   const [token, setToken] = useState<AccessToken | undefined>(undefined);
   const [error, setError] = useState<Error | undefined>(undefined);

   useEffect(() => {
      load(STORE_PATH)
         .then((store) => {
            store.get<AccessToken>("token").then((token) => {
               setToken(token);
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

   return { loading, token, error };
}

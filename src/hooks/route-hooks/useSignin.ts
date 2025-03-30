import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import { STORE_PATH } from "@/lib/constants";
import { logError, logInfo } from "@/lib/utils";
import { useNavigate } from "react-router";
import { AccessToken } from "@/lib/types";

export default function useSignin() {
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   useEffect(() => {
      setLoading(true);

      void (async () => {
         try {
            const store = await load(STORE_PATH);
            const token = await store.get<AccessToken>("token");
            if (token) {
               logInfo("[useSignin] found token, no need to signin " + token);
               // await wait(4); // For debugging 'loading' state
               navigate("/home");
            } else logInfo("[useSignin] no token found, awaiting signin");
         } catch (e) {
            logError(e);
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   return { loading };
}

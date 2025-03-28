import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import { STORE_PATH } from "@/lib/constants";
import { logError, logInfo, wait } from "@/lib/utils";
import { useNavigate } from "react-router";
import { AccessToken } from "@/lib/types";

export default function useSignin() {
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   useEffect(() => {
      load(STORE_PATH)
         .then((store) => {
            store.get<AccessToken>("token").then((token) => {
               if (token) {
                  logInfo("[sign in page] found token, no need to sign-in " + token);
                  wait(2).then(() => navigate("/home"));
               } else {
                  logInfo("[sign in page] no token found, awaiting signin");
                  setLoading(false);
               }
            });
         })
         .catch((e) => {
            logError(e);
            setLoading(false);
         });
   }, []);

   return { loading };
}

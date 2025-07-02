import { useEffect, useState } from "react";
import { alertInfo, checkAuth, logError, logInfo } from "@/lib/utils";
import { useNavigate } from "react-router";

export default function useSignin() {
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   useEffect(() => {
      setLoading(true);
      void (async () => {
         try {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
               alertInfo("[useSignin] Hello, welcome!");
               navigate("/home");
            } else logInfo("[useSignin] not authenticated, awaiting sign-in");
         } catch (e) {
            logError(e);
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   return { loading };
}

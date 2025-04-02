import { useEffect, useState } from "react";
import { checkAuth, logError, logInfo } from "@/lib/utils";
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
               logInfo("[useSignin] already authenticated, no need to sign-in");
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

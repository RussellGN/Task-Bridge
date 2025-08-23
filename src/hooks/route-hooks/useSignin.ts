import { useEffect, useState } from "react";
import { logError, logInfo } from "@/lib/logging";
import { checkAuth } from "@/lib/utils";
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
               navigate("/welcome");
            } else logInfo("[useSignin] not authenticated, awaiting sign-in");
         } catch (e) {
            logError(e);
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   useEffect(() => {
      const handleFocus = () => {
         window.location.reload();
      };

      window.addEventListener("focus", handleFocus);

      return () => {
         window.removeEventListener("focus", handleFocus);
      };
   }, []);

   return { loading };
}

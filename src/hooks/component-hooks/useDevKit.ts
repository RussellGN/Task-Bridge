import { AuthorInterface } from "@/lib/interfaces";
import { logError, logInfo } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export default function useDevKit() {
   const [isExpanded, setIsExpanded] = useState(false);
   const [loading, setLoading] = useState(false);

   function getUser() {
      setLoading(true);

      (async () => {
         try {
            const user = await invoke<AuthorInterface>("get_user");
            logInfo(user);
         } catch (e) {
            logError(e);
         } finally {
            setLoading(false);
         }
      })();
   }

   return { isExpanded, loading, experimental: { getUser }, setIsExpanded };
}

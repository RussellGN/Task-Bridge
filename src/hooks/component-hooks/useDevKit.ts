import { alertError, alertInfo } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export default function useDevKit() {
   const [isExpanded, setIsExpanded] = useState(false);
   const [loading, setLoading] = useState(false);

   function clearStore() {
      setLoading(true);
      invoke("clear_store")
         .then(() => alertInfo("[clearStore] Store cleared successfully"))
         .catch((e) => alertError("[clearStore] " + e))
         .finally(() => setLoading(false));
   }

   return { isExpanded, loading, experimental: { clearStore }, setIsExpanded };
}

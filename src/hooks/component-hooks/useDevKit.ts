import { alertError, alertInfo, logInfo } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function useDevKit() {
   const [isExpanded, setIsExpanded] = useState(false);
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   function clearStore() {
      setLoading(true);
      invoke("clear_store")
         .then(() => {
            alertInfo("[clearStore] Store cleared successfully");
            navigate("/");
         })
         .catch((e) => alertError("[clearStore] " + JSON.stringify(e)))
         .finally(() => setLoading(false));
   }

   function handleInputNavigation(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setLoading(true);
      const formData = new FormData(e.currentTarget);
      const route = formData.get("route") as string;
      logInfo("[handleInputNavigation] route: " + route);

      if (!route) {
         setLoading(false);
         return;
      }

      navigate(route);
      setLoading(false);
   }

   return { isExpanded, loading, experimental: { clearStore, handleInputNavigation }, setIsExpanded };
}

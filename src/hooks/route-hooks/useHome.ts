import { useEffect, useState } from "react";
import { load } from "@tauri-apps/plugin-store";
import { STORE_PATH } from "@/lib/constants";
import { alertError, checkAuth, logInfo } from "@/lib/utils";
import { UserInterface } from "@/lib/interfaces";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate, useSearchParams } from "react-router";

export default function useHome() {
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | string | null>(null);
   const [user, setUser] = useState<UserInterface | null>(null);
   const [searchParams, setSearchParams] = useSearchParams();
   const activeTab = searchParams.get("tab") || "home";
   const navigate = useNavigate();

   useEffect(() => {
      setLoading(true);
      setError(null);
      void (async () => {
         try {
            const isAuthenticated = await checkAuth();
            if (!isAuthenticated) {
               alertError("[useHome] You are not authenticated. Please sign in.");
               navigate("/");
            } else {
               logInfo("[useHome] User is authenticated");
               const store = await load(STORE_PATH);
               let userObj = await store.get<UserInterface>("user");
               if (!userObj) {
                  logInfo("[useHome] User not found, fetching from backend");
                  userObj = await invoke<UserInterface>("fetch_save_and_return_user");
               }
               setUser(userObj);
            }
         } catch (e) {
            setError(e as typeof error);
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   function setActiveTab(tab: string) {
      setSearchParams((prev) => {
         const newParams = new URLSearchParams(prev.toString());
         newParams.set("tab", tab);
         return newParams;
      });
   }

   return { loading, user, error, activeTab, setActiveTab };
}

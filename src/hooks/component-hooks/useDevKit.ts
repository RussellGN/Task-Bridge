import { STORE_PATH } from "@/lib/constants";
import { alertError, alertInfo, logInfo } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function useDevKit() {
   const [isExpanded, setIsExpanded] = useState(false);
   const [loading, setLoading] = useState(false);
   const [store, setStore] = useState<string | null>(null);
   const [showStore, setShowStore] = useState(false);
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

   function fetchStoreData() {
      setLoading(true);
      load(STORE_PATH)
         .then((store) => {
            (async () => {
               const keys = await store.keys();
               const allData: { [k: string]: unknown } = {};
               for (const key of keys) {
                  const value = await store.get(key);
                  allData[key] = value;
               }
               setStore(JSON.stringify(allData, null, 2));
            })();
         })
         .catch((e) => alertError("[showStore] " + JSON.stringify(e)))
         .finally(() => setLoading(false));
   }

   function closeStore() {
      setShowStore(false);
   }

   function openStore() {
      if (!store) fetchStoreData();
      setShowStore(true);
   }

   return {
      store,
      showStore,
      jsonViewStyle,
      isExpanded,
      loading,
      experimental: { fetchStoreData, closeStore, openStore, clearStore, handleInputNavigation },
      setIsExpanded,
   };
}

const jsonViewStyle = {
   "--w-rjv-color": "#9cdcfe",
   "--w-rjv-key-number": "#268bd2",
   "--w-rjv-key-string": "#9cdcfe",
   "--w-rjv-background-color": "#000000ff",
   "--w-rjv-line-color": "#ffffffc5",
   "--w-rjv-arrow-color": "#3eff00f2",
   "--w-rjv-edit-color": "#9cdcfe",
   "--w-rjv-info-color": "#00ce92f5",
   "--w-rjv-update-color": "#9cdcfe",
   "--w-rjv-copied-color": "#9cdcfe",
   "--w-rjv-copied-success-color": "#28a745",
   "--w-rjv-curlybraces-color": "#d4d4d4",
   "--w-rjv-colon-color": "#d4d4d4",
   "--w-rjv-brackets-color": "#d4d4d4",
   "--w-rjv-ellipsis-color": "#cb4b16",
   "--w-rjv-quotes-color": "#9cdcfe",
   "--w-rjv-quotes-string-color": "#ce9178",
   "--w-rjv-type-string-color": "#ce9178",
   "--w-rjv-type-int-color": "#b5cea8",
   "--w-rjv-type-float-color": "#b5cea8",
   "--w-rjv-type-bigint-color": "#b5cea8",
   "--w-rjv-type-boolean-color": "#569cd6",
   "--w-rjv-type-date-color": "#b5cea8",
   "--w-rjv-type-url-color": "#3b89cf",
   "--w-rjv-type-null-color": "#569cd6",
   "--w-rjv-type-nan-color": "#859900",
   "--w-rjv-type-undefined-color": "#569cd6",
   padding: "0.5rem",
   borderRadius: "0.5rem",
   flexGrow: 1,
   overflow: "auto",
};

import { STORE_PATH } from "@/lib/constants";
import { alertError, alertSuccess, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { AppPreferences } from "@/types/interfaces";
import { useMutation, useQuery } from "@tanstack/react-query";
import { load } from "@tauri-apps/plugin-store";
import React from "react";

export default function useAppPreferences() {
   const client = useClient();

   const { data, error, isPending } = useQuery({
      queryKey: ["app-preferences"],
      queryFn: async () => {
         const store = await load(STORE_PATH);
         const appPreferences = (await store.get<AppPreferences>("app-preferences")) || {};
         dbg("[useAppPreferences] app-preferences retrieved", appPreferences);
         return appPreferences;
      },
      enabled: true,
   });

   const { mutate, isPending: isMutating } = useMutation({
      mutationFn: async (newAppPreferences: AppPreferences) => {
         const store = await load(STORE_PATH);
         const oldAppPreferences = await store.get<AppPreferences>("app-preferences");
         await store.set("app-preferences", { ...oldAppPreferences, ...newAppPreferences });
      },
      onSuccess() {
         alertSuccess("[useAppPreferences] App Preferences saved!");
         client.invalidateQueries({ queryKey: ["app-preferences"] });
      },
      onError(err: Error | string) {
         dbg("[useAppPreferences]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useAppPreferences] Error saving app preferences", errorMessage);
      },
   });

   React.useEffect(() => {
      if (error) alertError("[useAppPreferences] error retrieving app preferences", error.message);
   }, [error]);

   function updateAppPreferences(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget)) as unknown as AppPreferences;
      dbg("Updating app preferences with data:", data);
      mutate(data);
   }

   return { appPreferences: data, appPreferencesloading: isPending || isMutating, updateAppPreferences };
}

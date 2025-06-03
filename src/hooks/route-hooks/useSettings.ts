import { STORE_PATH } from "@/lib/constants";
import { alertError, alertSuccess, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { Settings } from "@/types/interfaces";
import { useMutation, useQuery } from "@tanstack/react-query";
import { load } from "@tauri-apps/plugin-store";
import React from "react";

export default function useSettings() {
   const client = useClient();

   const { data, error, isPending } = useQuery({
      queryKey: ["settings"],
      queryFn: async () => {
         const store = await load(STORE_PATH);
         const settings = (await store.get<Settings>("settings")) || {};
         dbg("[useSettings] settings retrieved", settings);
         return settings;
      },
      enabled: true,
   });

   const { mutate, isPending: isMutating } = useMutation({
      mutationFn: async (newSettings: Settings) => {
         const store = await load(STORE_PATH);
         const oldSettings = await store.get<Settings>("settings");
         await store.set("settings", { ...oldSettings, ...newSettings });
      },
      onSuccess() {
         alertSuccess("[useSettings] Settings saved!");
         client.invalidateQueries({ queryKey: ["settings"] });
      },
      onError(err: Error | string) {
         dbg("[useSettings]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useSettings] Error saving settings", errorMessage);
      },
   });

   React.useEffect(() => {
      if (error) alertError("[useSettings] error retrieving settings", error.message);
   }, [error]);

   function patchSettings(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget)) as unknown as Settings;
      dbg("Patching settings with data:", data);
      mutate(data);
   }

   return { settings: data, loading: isPending || isMutating, patchSettings };
}

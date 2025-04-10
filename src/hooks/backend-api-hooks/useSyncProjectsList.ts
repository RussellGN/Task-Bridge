import { alertError, alertInfo, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export default function useSyncProjectsList() {
   const client = useClient();

   const { mutate, isPending, error } = useMutation({
      mutationFn: () => invoke("sync_projects_with_github"),
      onError(err: Error | string) {
         dbg("[useSyncProjectsList]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useSyncProjectsList] Error syncing projects with github: " + errorMessage);
      },
      onSuccess() {
         alertInfo(`[useSyncProjectsList] Done syncing projects with github!`);
         client.invalidateQueries({ queryKey: ["projects"] });
      },
   });

   const errorMessage = error instanceof Error ? error.message : error;

   return { isPending, errorMessage, syncProjects: mutate };
}

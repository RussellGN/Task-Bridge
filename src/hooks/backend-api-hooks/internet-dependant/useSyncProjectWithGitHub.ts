import { alertError, alertSuccess, dbg } from "@/lib/utils";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";
import { useClient } from "@/providers/ReactQueryProvider";
import { Project } from "@/types/interfaces";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export default function useSyncProjectWithGitHub(project: Project) {
   const client = useClient();
   const { doIfOnline } = useConnectionStatus();

   const { isPending, mutate } = useMutation({
      mutationFn: () => invoke("sync_project_with_github", { projectId: project.id }),
      onError(err: Error | string) {
         dbg("[useSyncProjectWithGitHub]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useSyncProjectWithGitHub] Error syncing project with GitHub: " + errorMessage);
      },
      onSuccess: () => {
         alertSuccess(`[useSyncProjectWithGitHub] sync complete! ${project.name} project was updated!`);
         client.invalidateQueries({ queryKey: ["project", project.id] });
         client.invalidateQueries({ queryKey: ["projects"] });
      },
   });

   return {
      isSyncing: isPending,
      syncProjectWithGitHub: () => doIfOnline(mutate, "Cannot sync project with GitHub whilst offline!"),
   };
}

import { PROJECT_DASHBOARD_SYNC_INTERVAL_MILLI_SECONDS } from "@/lib/constants";
import { alertError, alertInfo, alertSuccess, dbg } from "@/lib/utils";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";
import { useClient } from "@/providers/ReactQueryProvider";
import { useSyncedProjects } from "@/providers/SyncedProjectsProvider";
import { Project } from "@/types/interfaces";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";

export default function useSyncProjectWithGitHub(project: Project) {
   const client = useClient();
   const { doIfOnline } = useConnectionStatus();
   const { syncIfNotSynced } = useSyncedProjects();

   const { isPending, mutate } = useMutation({
      mutationFn: () => invoke("sync_project_with_github", { projectId: project.id }),
      onError(err: Error | string) {
         dbg("[useSyncProjectWithGitHub]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useSyncProjectWithGitHub] Error syncing project with GitHub: " + errorMessage);
      },
      onSuccess() {
         client.invalidateQueries({ queryKey: ["project", project.id] });
         client.invalidateQueries({ queryKey: ["projects"] });
         alertSuccess(`[useSyncProjectWithGitHub] sync complete! ${project.name} project was updated!`);
      },
   });

   const syncProjectWithGitHub = () => doIfOnline(mutate, "Cannot sync project with GitHub whilst offline!");

   useEffect(() => {
      // sync on mount
      syncIfNotSynced(project.id, syncProjectWithGitHub);

      dbg("[useSyncProjectWithGitHub]", "registering interval to sync project data for", project.name);

      const interval = window.setInterval(() => {
         doIfOnline(
            () => {
               alertInfo(`[useSyncProjectWithGitHub] Syncing ${project.name} with GitHub...`);
               mutate();
            },
            "GitHub sync attempt failed!",
            "This sync happens periodically in the background, but will not be attempted if you are offline.",
         );
      }, PROJECT_DASHBOARD_SYNC_INTERVAL_MILLI_SECONDS);

      dbg("[useSyncProjectWithGitHub]", "interval configured is", interval);

      return () => {
         dbg(
            "[useSyncProjectWithGitHub]",
            `clearing interval (${interval}) that was syncing project data for`,
            project.name,
         );
         window.clearInterval(interval);
      };
   }, []);

   return {
      isSyncing: isPending,
      syncProjectWithGitHub,
   };
}

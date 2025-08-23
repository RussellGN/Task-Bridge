import useSettings from "@/hooks/route-hooks/useSettings";
import { DEFAULT_PROJECT_SYNC_INTERVAL_MINS } from "@/lib/constants";
import { alertError, dbg, logInfo } from "@/lib/logging";
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
   const { appPreferences } = useSettings();

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
         logInfo(`[useSyncProjectWithGitHub] sync complete! ${project.name} project was updated!`);
      },
   });

   const syncProjectWithGitHub = () => doIfOnline(mutate, "Cannot sync project with GitHub whilst offline!");

   useEffect(() => {
      // sync on mount
      syncIfNotSynced(project.id, syncProjectWithGitHub);

      const intervalLengthMins = project.project_sync_interval_mins
         ? project.project_sync_interval_mins
         : appPreferences?.project_sync_interval_mins
           ? appPreferences?.project_sync_interval_mins
           : DEFAULT_PROJECT_SYNC_INTERVAL_MINS;

      dbg("[useSyncProjectWithGitHub]", `registering ${intervalLengthMins} minute sync interval for`, project.name);

      const interval = window.setInterval(
         () => {
            doIfOnline(
               () => {
                  logInfo(`[useSyncProjectWithGitHub] Syncing ${project.name} with GitHub...`);
                  mutate();
               },
               "GitHub sync attempt failed!",
               "This sync happens periodically in the background, but will not be attempted if you are offline.",
            );
         },
         intervalLengthMins * 60 * 1000,
      );

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

import { alertSuccess, dbg } from "@/lib/utils";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";
import { useClient } from "@/providers/ReactQueryProvider";
import { ActivitySyncResponse, Project } from "@/types/interfaces";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export default function useSyncTaskActivity(project: Project) {
   const client = useClient();
   const { doIfOnlineAsync } = useConnectionStatus();

   const { isPending, mutate } = useMutation({
      mutationFn: (taskId: string) =>
         invoke<ActivitySyncResponse>("sync_task_activity", { taskId, projectId: project.id }),
      onError(err: Error | string) {
         dbg("[useSyncTaskActivity]", err);
         // const errorMessage = err instanceof Error ? err.message : err;
         // alertError("[useSyncTaskActivity] Error syncing task activity: " + errorMessage);
      },
      onSuccess: ({ task_id, commits }) => {
         dbg("[useSyncTaskActivity]", commits);
         alertSuccess(`[useSyncTaskActivity] Activity sync complete!`);
         client.setQueryData(
            ["project", project.id],
            (oldData: Project) =>
               ({
                  ...oldData,
                  tasks: (oldData.tasks || []).map((t) =>
                     t.inner_issue.id.toString() === task_id ? { ...t, commits } : t,
                  ),
               }) as Project,
         );
      },
   });

   function syncTaskActivity(taskId: string) {
      return doIfOnlineAsync(() => {
         return new Promise((resolve) => mutate(taskId, { onSettled: () => resolve() }));
      }, "Cannot sync task activity whilst offline!");
   }

   return {
      isPending,
      syncTaskActivity,
   };
}

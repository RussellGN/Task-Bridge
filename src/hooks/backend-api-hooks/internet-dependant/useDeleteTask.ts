import { Project } from "@/types/interfaces";
import { alertError, alertSuccess, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";

export default function useDeleteTask(project: Project) {
   const client = useClient();
   const { doIfOnlineAsync } = useConnectionStatus();

   const { mutate, isPending, error } = useMutation({
      mutationFn: (taskId: string) => invoke<string>("delete_task", { taskId, projectId: project.id }),
      onError(err: Error | string) {
         dbg("[useDeleteTask]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useDeleteTask] Error deleting task!", errorMessage);
      },
      onSuccess(taskId) {
         dbg("[useDeleteTask]", taskId);
         alertSuccess(`[useDeleteTask] Task with id ${taskId} was deleted!`);
         client.setQueryData(["project", project.id], (oldData: Project) => ({
            ...oldData,
            tasks: (oldData.tasks || []).filter((t) => t.inner_issue.id.toString() !== taskId),
         }));
      },
   });

   function deleteTaskWithId(taskId: string | number) {
      return doIfOnlineAsync(() => {
         return new Promise((resolve) => mutate(taskId.toString(), { onSettled: () => resolve() }));
      }, "Cannot delete tasks whilst offline!");
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { deleteTaskWithId, isPending, errorMessage };
}

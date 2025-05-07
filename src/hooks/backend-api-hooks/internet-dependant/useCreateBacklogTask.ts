import { NewTaskPayload, Project, Task } from "@/types/interfaces";
import { alertError, alertSuccess, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";

export default function useCreateBacklogTask(project_id: string) {
   const client = useClient();
   const { doIfOnlineAsync } = useConnectionStatus();

   const { mutate, isPending, error } = useMutation({
      mutationFn: (payload: NewTaskPayload) => invoke<Task>("create_backlog_task", { payload }),
      onError(err: Error | string) {
         dbg("[useCreateBacklogTask]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useCreateBacklogTask] Error adding task to backlog", errorMessage);
      },
      onSuccess(task) {
         dbg("[useCreateBacklogTask]", task);
         alertSuccess(`[useCreateBacklogTask] Task added to backlog!`, task.inner_issue.title);
         client.setQueryData(["project", project_id], (oldData: Project) => ({
            ...oldData,
            tasks: [...(oldData.tasks || []), task],
         }));
      },
   });

   function createBacklogTask(payload: NewTaskPayload) {
      return doIfOnlineAsync(() => {
         return new Promise((resolve) => mutate(payload, { onSettled: () => resolve() }));
      }, "Cannot add tasks to backlog whilst offline!");
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { createBacklogTask, isPending, errorMessage };
}

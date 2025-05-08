import { Project, Task } from "@/types/interfaces";
import { alertError, alertSuccess, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";

export default function useAssignTaskNow(project: Project) {
   const client = useClient();
   const { doIfOnlineAsync } = useConnectionStatus();

   const { mutate, isPending, error } = useMutation({
      mutationFn: (taskId: string) => invoke<Task>("assign_task_now", { taskId, projectId: project.id }),
      onError(err: Error | string) {
         dbg("[useAssignTaskNow]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useAssignTaskNow] Error assigning task", errorMessage);
      },
      onSuccess(task) {
         dbg("[useAssignTaskNow]", task);
         alertSuccess(`[useAssignTaskNow] Task assigned!`, task.inner_issue.title);
         client.setQueryData(["project", project.id], (oldData: Project) => ({
            ...oldData,
            tasks: (oldData.tasks || []).map((t) => (t.inner_issue.id === task.inner_issue.id ? task : t)),
         }));
      },
   });

   function assignTaskNow(taskId: string | number) {
      return doIfOnlineAsync(() => {
         return new Promise((resolve) => mutate(taskId.toString(), { onSettled: () => resolve() }));
      }, "Cannot assign tasks whilst offline!");
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { assignTaskNow, isPending, errorMessage };
}

import { NewTaskPayload, Project, Task } from "@/types/interfaces";
import { alertError, alertSuccess, dbg } from "@/lib/logging";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";

export default function useEditTask(project_id: string) {
   const client = useClient();
   const { doIfOnlineAsync } = useConnectionStatus();

   const { mutate, isPending, error } = useMutation({
      mutationFn: ({ payload, taskId }: { payload: NewTaskPayload; taskId: string }) =>
         invoke<Task>("edit_task", { payload, taskId }),
      onError(err: Error | string) {
         dbg("[useEditTask]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useEditTask] Error editing task", errorMessage);
      },
      onSuccess(updatedTask) {
         dbg("[useEditTask]", updatedTask);
         alertSuccess(
            `[useEditTask] Task was updated!`,
            `${updatedTask.inner_issue.assignee?.login}: ${updatedTask.inner_issue.title}`,
         );
         client.setQueryData(
            ["project", project_id],
            (oldData: Project) =>
               ({
                  ...oldData,
                  tasks: [
                     ...(oldData.tasks || []).map((task) =>
                        task.inner_issue.id === updatedTask.inner_issue.id ? updatedTask : task,
                     ),
                  ],
               }) as Project,
         );
      },
   });

   function editTask(payload: NewTaskPayload, taskId: string) {
      return doIfOnlineAsync(() => {
         return new Promise((resolve) => mutate({ payload, taskId }, { onSettled: () => resolve() }));
      }, "Cannot edit tasks whilst offline!");
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { editTask, isPending, errorMessage };
}

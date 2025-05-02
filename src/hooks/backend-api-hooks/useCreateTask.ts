import { NewTaskPayload, Task } from "@/types/interfaces";
import { alertError, alertInfo, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export default function useCreateTask(project_id: string) {
   const client = useClient();

   const { mutate, isPending, error } = useMutation({
      mutationFn: (payload: NewTaskPayload) => invoke<Task>("create_task", { payload }),
      onError(err: Error | string) {
         dbg("[useCreateTask]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useCreateTask] Error creating task", errorMessage);
      },
      onSuccess(task) {
         dbg("[useCreateTask]", task);
         alertInfo(`[useCreateTask] Task created!`, task.inner_issue.title);
         client.invalidateQueries({ queryKey: ["project", project_id] });
      },
   });

   async function createTask(payload: NewTaskPayload) {
      mutate(payload);
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { createTask, isPending, errorMessage };
}

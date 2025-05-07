import { DraftTask, NewDraftTaskPayload, Project } from "@/types/interfaces";
import { alertError, alertSuccess, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export default function useCreateDraftTask(project_id: string) {
   const client = useClient();

   const { mutate, isPending, error } = useMutation({
      mutationFn: (payload: NewDraftTaskPayload) => invoke<DraftTask>("create_draft_task", { payload }),
      onError(err: Error | string) {
         dbg("[useCreateDraftTask]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useCreateDraftTask] Error creating draft task", errorMessage);
      },
      onSuccess(draft) {
         dbg("[useCreateDraftTask]", draft);
         alertSuccess(`[useCreateDraftTask] Draft task created!`, draft.title);
         client.setQueryData(["project", project_id], (oldData: Project) => ({
            ...oldData,
            draft_tasks: [...(oldData.draft_tasks || []), draft],
         }));
      },
   });

   function createDraft(payload: NewDraftTaskPayload) {
      return new Promise((resolve) => mutate(payload, { onSettled: resolve }));
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { createDraft, isPending, errorMessage };
}

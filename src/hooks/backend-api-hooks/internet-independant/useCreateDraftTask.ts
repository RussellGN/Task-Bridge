import { DraftTask, NewDraftTaskPayload } from "@/types/interfaces";
import { alertError, alertInfo, dbg } from "@/lib/utils";
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
         alertInfo(`[useCreateDraftTask] Draft task created!`, draft.title);
         client.invalidateQueries({ queryKey: ["project", project_id] });
      },
   });

   async function createDraft(payload: NewDraftTaskPayload) {
      mutate(payload);
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { createDraft, isPending, errorMessage };
}

import { DraftTask, NewDraftTaskPayload, Project } from "@/types/interfaces";
import { alertError, dbg, logInfo } from "@/lib/logging";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export default function useEditDraftTask(project_id: string) {
   const client = useClient();

   const { mutate, isPending, error } = useMutation({
      mutationFn: ({ payload, draftId }: { payload: NewDraftTaskPayload; draftId: string }) =>
         invoke<DraftTask>("edit_draft_task", { payload, draftId }),
      onError(err: Error | string) {
         dbg("[useEditDraftTask]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useEditDraftTask] Error editing draft", errorMessage);
      },
      onSuccess(updatedDraft) {
         dbg("[useEditDraftTask]", updatedDraft);
         logInfo(`[useEditDraftTask] Draft was updated!`, `${updatedDraft.assignee?.login}: ${updatedDraft.title}`);
         client.setQueryData(
            ["project", project_id],
            (oldData: Project) =>
               ({
                  ...oldData,
                  draft_tasks: [
                     ...(oldData.draft_tasks || []).map((draft) =>
                        draft.id === updatedDraft.id ? updatedDraft : draft,
                     ),
                  ],
               }) as Project,
         );
      },
   });

   function editDraftTask(payload: NewDraftTaskPayload, draftId: string) {
      mutate({ payload, draftId });
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { editDraftTask, isPending, errorMessage };
}

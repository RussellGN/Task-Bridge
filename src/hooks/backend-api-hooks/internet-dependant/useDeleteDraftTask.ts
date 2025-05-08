import { Project } from "@/types/interfaces";
import { alertError, alertSuccess, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export default function useDeleteDraftTask(project: Project) {
   const client = useClient();

   const { mutate, isPending, error } = useMutation({
      mutationFn: (draftId: string) => invoke<string>("delete_draft_task", { draftId, projectId: project.id }),
      onError(err: Error | string) {
         dbg("[useDeleteDraftTask]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useDeleteDraftTask] Error deleting draft!", errorMessage);
      },
      onSuccess(draftId) {
         dbg("[useDeleteDraftTask]", draftId);
         alertSuccess(`[useDeleteDraftTask] Draft with id ${draftId} was deleted!`);
         client.setQueryData(
            ["project", project.id],
            (oldData: Project) =>
               ({
                  ...oldData,
                  draft_tasks: (oldData.draft_tasks || []).filter((d) => d.id !== draftId),
               }) as Project,
         );
      },
   });

   function deleteDraftTaskWithId(draftId: string | number) {
      mutate(draftId.toString());
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { deleteDraftTaskWithId, isPending, errorMessage };
}

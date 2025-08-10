import { DraftTaskAssignmentResponse, Project } from "@/types/interfaces";
import { alertError, alertSuccess, dbg } from "@/lib/logging";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";

export default function useAssignDraftTaskNow(project: Project) {
   const client = useClient();
   const { doIfOnlineAsync } = useConnectionStatus();

   const { mutate, isPending, error } = useMutation({
      mutationFn: (draftId: string) =>
         invoke<DraftTaskAssignmentResponse>("assign_draft_task_now", { draftId, projectId: project.id }),
      onError(err: Error | string) {
         dbg("[useAssignDraftTaskNow]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useAssignDraftTaskNow] Error assigning drafted task", errorMessage);
      },
      onSuccess({ old_draft_id, task }) {
         dbg("[useAssignDraftTaskNow]", task, old_draft_id);
         alertSuccess(
            `[useAssignDraftTaskNow] Drafted Task assigned!`,
            task.inner_issue.title + ` (from draft: ${old_draft_id})`,
         );
         client.setQueryData(
            ["project", project.id],
            (oldData: Project) =>
               ({
                  ...oldData,
                  tasks: [...(oldData.tasks || []), task],
                  draft_tasks: (oldData.draft_tasks || []).filter((t) => t.id !== old_draft_id),
               }) as Project,
         );
      },
   });

   function assignDraftTaskNow(draftId: string | number) {
      return doIfOnlineAsync(() => {
         return new Promise((resolve) => mutate(draftId.toString(), { onSettled: () => resolve() }));
      }, "Cannot assign drafted tasks whilst offline!");
   }

   const errorMessage = error instanceof Error ? error.message : error;

   return { assignDraftTaskNow, isPending, errorMessage };
}

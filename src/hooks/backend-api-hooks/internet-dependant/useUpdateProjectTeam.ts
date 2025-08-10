import { alertError, alertSuccess, dbg } from "@/lib/logging";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";
import { ProjectPatchArgs } from "@/types/interfaces";
import { useMutation } from "@tanstack/react-query";
import { useClient } from "@/providers/ReactQueryProvider";
import { invoke } from "@tauri-apps/api/core";

export default function useUpdateProjectTeam(project_id: string | undefined) {
   const client = useClient();
   const { doIfOnlineAsync } = useConnectionStatus();

   const { mutate, isPending } = useMutation({
      mutationFn: (patchArgs: ProjectPatchArgs) => invoke("update_project_team", { patchArgs }),
      onError(err: Error | string) {
         dbg("[useUpdateProjectTeam]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useUpdateProjectTeam] Error updating project team", errorMessage);
      },
      onSuccess() {
         alertSuccess(`[useUpdateProjectTeam] Project team updated!`);
         client.invalidateQueries({ queryKey: ["project", project_id] });
      },
   });

   function updateProjectTeam(patchArgs: ProjectPatchArgs) {
      return doIfOnlineAsync(() => {
         return new Promise((resolve) => mutate(patchArgs, { onSettled: () => resolve() }));
      }, "Cannot update project team whilst offline!");
   }

   return { updateProjectTeam, isPending };
}

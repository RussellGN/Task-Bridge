import { alertError, alertSuccess, dbg, stringifyAndRemoveQuotes } from "@/lib/utils";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";
import { ProjectPatchArgs } from "@/types/interfaces";
import { useMutation } from "@tanstack/react-query";
import { useClient } from "@/providers/ReactQueryProvider";
import { invoke } from "@tauri-apps/api/core";

export default function useUpdateGeneralProjectMetadata(projectId: string | undefined) {
   const F = "[useUpdateGeneralProjectMetadata]";
   const client = useClient();
   const { doIfOnlineAsync } = useConnectionStatus();

   const { mutate, isPending } = useMutation({
      mutationFn: (patchArgs: ProjectPatchArgs) => invoke("update_general_project_metadata", { patchArgs }),
      onError: (err) => {
         dbg(`${F}`, err);
         alertError(`${F} Error updating general project metadata`, err.message || stringifyAndRemoveQuotes(err));
      },
      onSuccess: () => {
         alertSuccess(`${F} Project metadata updated!`);
         client.invalidateQueries({ queryKey: ["project", projectId] });
         client.invalidateQueries({ queryKey: ["projects"] });
      },
   });

   async function updateGeneralProjectMetadata(patchArgs: ProjectPatchArgs) {
      await doIfOnlineAsync(async () => await mutate(patchArgs), "Cannot update project metadata whilst offline");
   }

   return {
      isPending,
      updateGeneralProjectMetadata,
   };
}

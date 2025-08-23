import { STORE_PATH } from "@/lib/constants";
import { alertError, logInfo } from "@/lib/logging";
import { useClient } from "@/providers/ReactQueryProvider";
import { Project, ProjectPatchArgs } from "@/types/interfaces";
import { useMutation } from "@tanstack/react-query";
import { load } from "@tauri-apps/plugin-store";

export default function useUpdateProjectSyncSettings() {
   const F = "[useUpdateProjectSyncSettings]";
   const client = useClient();

   const { mutate, isPending } = useMutation({
      mutationFn: async (patchArgs: ProjectPatchArgs) => {
         const store = await load(STORE_PATH);
         const project = await store.get<Project>(patchArgs.project_id);
         if (!project) throw new Error(`Project with ID ${patchArgs.project_id} not found.`);
         project.project_sync_interval_mins = Number(patchArgs.settings_patch.project_sync_interval_mins);
         store.set(patchArgs.project_id, project);
         return project;
      },
      onError: (error) => alertError(`${F} Error updating project sync settings`, error.message),
      onSuccess: (project) => {
         client.setQueryData(["project", project.id], project);
         logInfo(`${F} Project sync settings updated successfully for ${project.name}.`);
      },
   });

   return { updateProjectSyncSettings: mutate, isPending };
}

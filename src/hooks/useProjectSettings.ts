import React from "react";
import useGetProject from "./backend-api-hooks/internet-independant/useGetProject";
import { alertError, dbg, stringifyAndRemoveQuotes } from "@/lib/utils";
import { ProjectSettingsPatchPayload } from "@/types/interfaces";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router";
import { invoke } from "@tauri-apps/api/core";

export default function useProjectSettings() {
   const F = "[useProjectSettings]";
   const { projectId } = useParams();
   const { project, isLoading } = useGetProject(projectId);

   const {
      mutate,
      error,
      isPending: isMutating,
   } = useMutation({
      mutationFn: async (settingsPatch: ProjectSettingsPatchPayload) => {
         const patchArgs = { projectId: project!.id, settingsPatch };
         if (settingsPatch.permanentDeleteProject) {
            if (settingsPatch.permanentDeleteProject === `delete ${project?.name}`) {
               await invoke("permanently_delete_project", patchArgs);
               return;
            }
            throw new Error("Delete instruction does not match expected format");
         }

         if (settingsPatch.name && settingsPatch.repoName && settingsPatch.repoVisibility) {
            await invoke("update_general_project_metadata", patchArgs);
         }

         if (settingsPatch.team) await invoke("update_project_team", patchArgs);

         if (settingsPatch.project_sync_interval) await invoke("update_project_sync_settings", patchArgs);
      },
   });

   React.useEffect(() => {
      if (error) {
         alertError(`${F} Error updating project settings`, error.message || stringifyAndRemoveQuotes(error));
      }
   }, [error]);

   function updateProjectSettings(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const settingsPatch = Object.fromEntries(new FormData(e.currentTarget)) as unknown as ProjectSettingsPatchPayload;
      dbg("[updateProjectSettings] Updating project settings", settingsPatch);
      mutate(settingsPatch);
   }

   return { project, projectLoading: isLoading || isMutating, updateProjectSettings };
}

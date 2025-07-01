import React from "react";
import useGetProject from "./backend-api-hooks/internet-independant/useGetProject";
import useDeleteProjectPermanently from "./backend-api-hooks/internet-independant/useDeleteProjectPermanently";
import { ProjectSettingsPatchPayload } from "@/types/interfaces";
import { alertError, dbg } from "@/lib/utils";
import { useParams } from "react-router";
import { invoke } from "@tauri-apps/api/core";

export default function useProjectSettings() {
   const F = "[useProjectSettings]";
   const { projectId } = useParams();
   const { project, isLoading } = useGetProject(projectId);
   const { deleteProjectPermanently, isPending: isProjectDeleting } = useDeleteProjectPermanently(projectId);

   function updateProjectSettings(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const settings_patch = Object.fromEntries(
         new FormData(e.currentTarget),
      ) as unknown as ProjectSettingsPatchPayload;
      dbg("[updateProjectSettings] Updating project settings", settings_patch);

      (async () => {
         if (settings_patch.permanent_delete_project) {
            if (settings_patch.permanent_delete_project === `delete ${project?.name}`) deleteProjectPermanently();
            else alertError(`${F} Delete instruction does not match expected format`);
            return;
         }

         const patchArgs = { project_id: project!.id, settingsPatch: settings_patch };

         if (settings_patch.name && settings_patch.repo_name && settings_patch.repo_visibility) {
            await invoke("update_general_project_metadata", patchArgs);
         }

         if (settings_patch.team) await invoke("update_project_team", patchArgs);

         if (settings_patch.project_sync_interval) await invoke("update_project_sync_settings", patchArgs);
      })();
   }

   return { project, projectLoading: isLoading || isProjectDeleting, updateProjectSettings };
}

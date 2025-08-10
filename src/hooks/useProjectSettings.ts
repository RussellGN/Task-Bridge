import { useParams } from "react-router";
import { alertError, dbg } from "@/lib/logging";
import { ProjectPatchArgs, ProjectSettingsPatchPayload } from "@/types/interfaces";
import useDeleteProjectPermanently from "./backend-api-hooks/internet-independant/useDeleteProjectPermanently";
import useUpdateProjectSyncSettings from "./useUpdateProjectSyncSettings";
import useDeleteProjectLocally from "./backend-api-hooks/internet-independant/useDeleteProjectLocally";
import useUpdateProjectTeam from "./backend-api-hooks/internet-dependant/useUpdateProjectTeam";
import useGetProject from "./backend-api-hooks/internet-independant/useGetProject";
import React from "react";
import useUpdateGeneralProjectMetadata from "./backend-api-hooks/internet-dependant/useUpdateGeneralProjectMetadata";

export default function useProjectSettings() {
   const F = "[useProjectSettings]";
   const { projectId } = useParams();
   const { project, isLoading } = useGetProject(projectId);
   const { deleteProjectPermanently, isPending: isProjectDeleting } = useDeleteProjectPermanently(projectId);
   const { deleteProjectLocally, isPending: isProjectDeletingLocally } = useDeleteProjectLocally(projectId);
   const { updateProjectSyncSettings, isPending: isUpdatingSyncSettings } = useUpdateProjectSyncSettings();
   const { updateProjectTeam, isPending: isProjectTeamUpdating } = useUpdateProjectTeam(projectId);
   const { updateGeneralProjectMetadata, isPending: isProjectMetaUpdating } =
      useUpdateGeneralProjectMetadata(projectId);

   function updateProjectSettings(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const settings_patch = Object.fromEntries(data) as unknown as ProjectSettingsPatchPayload;
      settings_patch.repo_is_private = undefined;
      settings_patch.repo_is_private = data.get("repo_visibility") === "private" ? true : false;

      dbg("[updateProjectSettings] Updating project settings", settings_patch);

      (async () => {
         try {
            if (settings_patch.permanent_delete_project) {
               if (settings_patch.permanent_delete_project === `delete ${project?.name}`) deleteProjectPermanently();
               else alertError(`${F} Delete instruction does not match expected format`);
               return;
            }

            if (settings_patch.locally_delete_project) {
               if (settings_patch.locally_delete_project === `delete ${project?.name}`) deleteProjectLocally();
               else alertError(`${F} Delete instruction does not match expected format`);
               return;
            }

            const patchArgs = { project_id: project!.id, settings_patch: settings_patch } as ProjectPatchArgs;

            if (settings_patch.name || settings_patch.repo_name || settings_patch.repo_is_private) {
               await updateGeneralProjectMetadata(patchArgs);
            }

            if (settings_patch.team) await updateProjectTeam(patchArgs);

            if (settings_patch.project_sync_interval_mins) await updateProjectSyncSettings(patchArgs);
         } catch (error) {
            alertError(`${F} Error updating project settings: ${error}`);
         }
      })();
   }

   return {
      project,
      projectLoading:
         isLoading ||
         isProjectDeleting ||
         isProjectDeletingLocally ||
         isUpdatingSyncSettings ||
         isProjectTeamUpdating ||
         isProjectMetaUpdating,
      updateProjectSettings,
   };
}

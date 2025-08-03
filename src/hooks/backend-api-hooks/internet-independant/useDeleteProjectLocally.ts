import { invoke } from "@tauri-apps/api/core";
import { Project } from "@/types/interfaces";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { alertError, alertSuccess, dbg } from "@/lib/utils";

export default function useDeleteProjectLocally(projectId: string | undefined) {
   const client = useClient();
   const navigate = useNavigate();

   const { mutate, isPending } = useMutation({
      mutationFn: () => invoke("delete_project_locally", { projectId }),
      onError(err: Error | string) {
         dbg("[useDeleteProjectLocally]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useDeleteProjectLocally] Error deleting project locally", errorMessage);
      },
      onSuccess() {
         alertSuccess("[useDeleteProjectLocally] project deleted from computer!", `Id: ${projectId}`);
         client.removeQueries({ queryKey: ["project", projectId] });
         client.setQueryData(["projects"], (prev: Project[] | null) =>
            prev ? prev.filter((p) => p.id !== projectId) : null,
         );

         navigate("/projects");
      },
   });

   return {
      deleteProjectLocally: mutate,
      isPending,
   };
}

import { invoke } from "@tauri-apps/api/core";
import { Project } from "@/types/interfaces";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useConnectionStatus } from "@/providers/ConnectionStatusProvider";
import { alertError, alertSuccess, dbg } from "@/lib/utils";

export default function useDeleteProjectPermanently(projectId: string | undefined) {
   const client = useClient();
   const navigate = useNavigate();
   const { doIfOnline } = useConnectionStatus();

   const { mutate, isPending } = useMutation({
      mutationFn: () => invoke("delete_project_permanently", { projectId }),
      onError(err: Error | string) {
         dbg("[useDeleteProjectPermanently]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useDeleteProjectPermanently] Error deleting project permanently", errorMessage);
      },
      onSuccess() {
         alertSuccess("[useDeleteProjectPermanently] project deleted permanently!", `Id: ${projectId}`);
         client.removeQueries({ queryKey: ["project", projectId] });
         client.setQueryData(["projects"], (prev: Project[] | null) =>
            prev ? prev.filter((p) => p.id !== projectId) : null,
         );

         navigate("/home?tab=all");
      },
   });

   return {
      deleteProjectPermanently: () => doIfOnline(mutate, "Cannot delete project permanently whilst offline"),
      isPending,
   };
}

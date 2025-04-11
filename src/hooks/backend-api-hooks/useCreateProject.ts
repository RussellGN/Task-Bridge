import { NewProjectPayload, Project } from "@/types/interfaces";
import { alertError, alertInfo, dbg } from "@/lib/utils";
import { useClient } from "@/providers/ReactQueryProvider";
import { useMutation } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router";

export default function useCreateProject() {
   const client = useClient();
   const navigate = useNavigate();

   const { mutate, isPending, error } = useMutation({
      mutationFn: (payload: NewProjectPayload) => invoke<Project>("create_project", { payload }),
      onError(err: Error | string) {
         dbg("[useNewProjectTab]", err);
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useNewProjectTab] Error creating project: " + errorMessage);
      },
      onSuccess(project) {
         dbg("[useNewProjectTab]", project);
         alertInfo(`[useNewProjectTab] ${project.name} project was created!`);
         client.setQueryData(["project", project.id], project);
         client.setQueryData(["projects"], (prev: Project[] | null) => (prev ? [...prev, project] : [project]));
         navigate("/project-dashboard/" + project.id);
      },
   });

   const errorMessage = error instanceof Error ? error.message : error;
   return { createProject: mutate, isPending, errorMessage };
}

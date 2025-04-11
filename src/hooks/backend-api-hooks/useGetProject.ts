import { STORE_PATH } from "@/lib/constants";
import { alertError } from "@/lib/utils";
import { Project } from "@/types/interfaces";
import { useQuery } from "@tanstack/react-query";
import { load } from "@tauri-apps/plugin-store";

export default function useGetProject(projectId: string) {
   const { data, isLoading, error } = useQuery({
      queryKey: ["project", projectId],
      queryFn: async () => {
         const store = await load(STORE_PATH);
         const project = await store.get<Project>(projectId);
         if (project) return project;
         alertError(`[useGetProject] Project with id '${projectId}' not found`);
         throw new Error(`Project with id '${projectId}' could not be found`);
      },
      enabled: !!projectId,
   });

   const errorMessage = error instanceof Error ? error.message : error;
   return { project: data, isLoading, errorMessage };
}

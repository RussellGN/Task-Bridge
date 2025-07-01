import { STORE_PATH } from "@/lib/constants";
import { Project } from "@/types/interfaces";
import { useQuery } from "@tanstack/react-query";
import { load } from "@tauri-apps/plugin-store";

export default function useGetProject(projectId: string | undefined) {
   const { data, isLoading, error } = useQuery({
      queryKey: ["project", projectId],
      queryFn: async () => {
         if (!projectId) throw new Error("[useGetProject] No project ID provided"); // no alert, hook was called from settings
         const store = await load(STORE_PATH);
         const project = await store.get<Project>(projectId);
         if (project) return project;
         throw new Error(`Project with id '${projectId}' could not be found`);
      },
      enabled: !!projectId,
   });

   const errorMessage = error instanceof Error ? error.message : error;
   return { project: data, isLoading, errorMessage };
}

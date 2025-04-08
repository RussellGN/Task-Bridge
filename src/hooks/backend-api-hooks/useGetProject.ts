import { STORE_PATH } from "@/lib/constants";
import { alertError } from "@/lib/utils";
import { Project } from "@/types/interfaces";
import { useQuery } from "@tanstack/react-query";
import { load } from "@tauri-apps/plugin-store";

export default function useGetProject(projectName: string) {
   const { data, isLoading, error } = useQuery({
      queryKey: ["project", projectName],
      queryFn: async () => {
         const store = await load(STORE_PATH);
         const project = await store.get<Project>(projectName);
         if (project) return project;
         alertError(`[useGetProject] Project '${projectName}' not found`);
         throw new Error(`Project '${projectName}' could not be found`);
      },
      enabled: !!projectName,
   });

   const errorMessage = error instanceof Error ? error.message : error;
   return { project: data, isLoading, errorMessage };
}

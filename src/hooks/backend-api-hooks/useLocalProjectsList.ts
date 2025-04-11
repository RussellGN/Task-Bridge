import { STORE_PATH } from "@/lib/constants";
import { Project } from "@/types/interfaces";
import { useQuery } from "@tanstack/react-query";
import { load } from "@tauri-apps/plugin-store";
import useSyncProjectsList from "./useSyncProjectsList";
import { alertError, dbg } from "@/lib/utils";

export default function useLocalProjectsList() {
   const F = "[useLocalProjectsList]";
   const { syncProjects, errorMessage: e, isPending } = useSyncProjectsList();

   const { data, isLoading, error } = useQuery<Project[]>({
      queryKey: ["projects"],
      queryFn: async () => {
         const store = await load(STORE_PATH);
         const projectIds = await store.get<string[]>("project-ids");

         if (projectIds === undefined) {
            throw new Error("No projects found locally, trigger a sync with github or create a new project");
         } else {
            const projects = [] as Project[];

            for (const id of projectIds) {
               const project = await store.get<Project>(id);
               if (project) projects.push(project);
            }

            if (projects.length !== projectIds.length) {
               alertError(
                  `${F} Only ${projects.length} of ${projectIds.length} were found in the local store. Please sync with Github to update the project list.`,
               );
               dbg(F, projectIds, projects);
            }

            return projects;
         }
      },
      enabled: true,
   });

   return {
      projects: data,
      isLoading: isLoading || isPending,
      errorMessage: e ? e : error instanceof Error ? error.message : error,
      syncProjects: () => void syncProjects(),
   };
}

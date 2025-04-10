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
         const projectNames = await store.get<string[]>("project-names");

         if (projectNames === undefined) {
            alertError(`${F} No projects found locally, trigger a sync with github or create a new project`);
            throw new Error("No projects found locally, trigger a sync with github or create a new project");
         } else {
            const projects = [] as Project[];

            for (const name of projectNames) {
               const project = await store.get<Project>(name);
               if (project) projects.push(project);
            }

            if (projects.length !== projectNames.length) {
               alertError(
                  `${F} Only ${projects.length} of ${projectNames.length} were found in the local store. Please sync with Github to update the project list.`,
               );
               dbg(F, projectNames, projects);
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

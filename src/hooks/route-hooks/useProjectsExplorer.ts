import useLocalProjectsList from "../backend-api-hooks/internet-independant/useLocalProjectsList";

export default function useProjectsExplorer() {
   const { projects, isLoading, syncProjects } = useLocalProjectsList();

   const locallyCreatedProjects = projects?.filter((p) => p.locally_created) || [];
   const syncedProjects = projects?.filter((p) => !p.locally_created) || [];

   return {
      isLoading,
      syncedProjects,
      locallyCreatedProjects,
      syncProjects,
   };
}

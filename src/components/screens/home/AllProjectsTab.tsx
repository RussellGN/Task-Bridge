import ProjectCard from "./ProjectCard";
import ErrorDisplay from "@/components/general/ErrorDisplay";
import Spinner from "@/components/general/Spinner";
import useLocalProjectsList from "@/hooks/backend-api-hooks/useLocalProjectsList";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";

export default function AllProjectsTab() {
   const { projects, isLoading, errorMessage, syncProjects } = useLocalProjectsList();

   return (
      <div>
         <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-foreground/50 flex items-center gap-2">Locally created projects</h1>

            <Button disabled={isLoading} variant="PRIMARY" onClick={syncProjects}>
               Sync With Github
               <DownloadCloud />
            </Button>
         </div>

         <ErrorDisplay containerClassName="mb-3" error={errorMessage} />

         {isLoading ? (
            <div className="mb-3 text-center">
               <Spinner size="lg" />
            </div>
         ) : projects?.length === 0 ? (
            <p className="text-foreground/50 text-center">No projects found</p>
         ) : (
            <div className="flex max-h-[80vh] flex-wrap overflow-y-auto">
               {projects?.map((project, index) => <ProjectCard key={index} project={project} />)}

               <div className="text-foreground/50 my-10 flex w-full items-center gap-2">
                  Synced from GitHub
                  <DownloadCloud />
               </div>
            </div>
         )}
      </div>
   );
}

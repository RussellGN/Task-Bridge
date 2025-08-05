import Spinner from "@/components/general/Spinner";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Folder } from "lucide-react";
import NewProjectForm from "@/components/screens/projects-explorer/NewProjectForm";
import ProjectCard from "@/components/screens/home/ProjectCard";
import useProjectsExplorer from "@/hooks/route-hooks/useProjectsExplorer";

export default function ProjectsExplorer() {
   const { isLoading, syncedProjects, locallyCreatedProjects, syncProjects } = useProjectsExplorer();

   return (
      <div className="grid h-full grid-cols-2 items-start gap-5 p-5">
         <div>
            <div className="mb-4 flex items-center gap-3 px-4">
               <h1 className="mr-auto flex items-center gap-2">
                  <DownloadCloud />
                  Synced from GitHub
               </h1>

               <Button disabled={isLoading} size="sm" variant="PRIMARY" onClick={syncProjects}>
                  Sync Now
                  <DownloadCloud />
               </Button>
            </div>

            {isLoading ? (
               <div className="mb-3 pt-30 text-center">
                  <Spinner size="lg" />
                  <div className="text-foreground/50 mt-2 text-sm">
                     This may take a few minutes depending on the number <br /> of GitHub repositories you have.
                  </div>
               </div>
            ) : syncedProjects.length === 0 ? (
               <p className="text-foreground/50 pt-30 text-center text-sm">0 projects</p>
            ) : (
               <div className="grid h-[80vh] grid-cols-2 items-start gap-2 overflow-y-auto pr-3 sm:grid-cols-3 lg:grid-cols-4">
                  {syncedProjects.map((project, index) => (
                     <ProjectCard key={index} project={project} />
                  ))}
               </div>
            )}
         </div>

         <div>
            <div className="mb-4 flex items-center gap-3 px-4">
               <h1 className="mr-auto flex items-center gap-2">
                  <Folder />
                  Locally created projects
               </h1>

               <NewProjectForm />
            </div>

            {locallyCreatedProjects.length === 0 ? (
               <p className="text-foreground/50 pt-30 text-center text-sm">0 projects</p>
            ) : (
               <div className="grid h-[80vh] grid-cols-2 items-start gap-2 overflow-y-auto pr-3 sm:grid-cols-3 lg:grid-cols-4">
                  {locallyCreatedProjects.map((project, index) => (
                     <ProjectCard key={index} project={project} />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}

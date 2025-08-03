import Spinner from "@/components/general/Spinner";
import useLocalProjectsList from "@/hooks/backend-api-hooks/internet-independant/useLocalProjectsList";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Folder } from "lucide-react";
import NewProjectForm from "@/components/screens/projects-explorer/NewProjectForm";
import ProjectCard from "@/components/screens/home/ProjectCard";

export default function ProjectsExplorer() {
   const { projects, isLoading, syncProjects } = useLocalProjectsList();

   const locallyCreatedProjects = projects?.filter((p) => p.locally_created) || [];
   const syncedProjects = projects?.filter((p) => !p.locally_created) || [];

   return (
      <div className="grid h-full grid-cols-2 items-start gap-5 p-5">
         <div>
            <div className="mb-4 flex items-center gap-3">
               <h1 className="text-foreground/50 mr-auto flex items-center gap-2">
                  Locally created projects <Folder />
               </h1>

               <NewProjectForm />
            </div>

            {locallyCreatedProjects.length === 0 ? (
               <p className="text-foreground/50 pt-30 text-center text-sm">0 projects</p>
            ) : (
               <div className="flex max-h-[80vh] flex-wrap overflow-y-auto pr-3">
                  {locallyCreatedProjects.map((project, index) => (
                     <ProjectCard key={index} project={project} />
                  ))}
               </div>
            )}
         </div>

         <div>
            <div className="mb-4 flex items-center gap-3">
               <h1 className="text-foreground/50 mr-auto flex items-center gap-2">
                  Synced from GitHub <DownloadCloud />
               </h1>

               <Button disabled={isLoading} variant="PRIMARY" onClick={syncProjects}>
                  Sync With Github
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
               <div className="flex max-h-[80vh] flex-wrap overflow-y-auto pr-3">
                  {syncedProjects.map((project, index) => (
                     <ProjectCard key={index} project={project} />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}

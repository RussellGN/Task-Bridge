import ProjectCard from "./ProjectCard";
import ErrorDisplay from "@/components/general/ErrorDisplay";
import Spinner from "@/components/general/Spinner";
import useLocalProjectsList from "@/hooks/backend-api-hooks/internet-independant/useLocalProjectsList";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";
import NewProjectForm from "../projects-explorer/NewProjectForm";

export default function AllProjectsTab() {
   const { projects, isLoading, errorMessage, syncProjects } = useLocalProjectsList();

   return (
      <div className="px-5">
         <div className="mb-4 flex items-center gap-3">
            <h1 className="text-foreground/50 mr-auto flex items-center gap-2">Locally created projects</h1>

            <NewProjectForm />

            <Button disabled={isLoading} variant="PRIMARY" onClick={syncProjects}>
               Sync With Github
               <DownloadCloud />
            </Button>
         </div>

         {!isLoading && errorMessage && (
            <ErrorDisplay lightError={!projects?.length} containerClassName="mb-3" error={errorMessage} />
         )}

         {isLoading ? (
            <div className="mb-3 pt-30 text-center">
               <Spinner size="lg" />
               <div className="text-foreground/50 mt-2 text-sm">
                  This may take a few minutes depending on the number <br /> of GitHub repositories you have.
               </div>
            </div>
         ) : projects?.length === 0 ? (
            <p className="text-foreground/50 text-center">No projects found</p>
         ) : (
            <div className="flex max-h-[80vh] flex-wrap overflow-y-auto">
               {projects
                  ?.filter((p) => p.locally_created)
                  .map((project, index) => <ProjectCard key={index} project={project} />)}

               <div className="text-foreground/50 my-10 flex w-full items-center gap-2">
                  Synced from GitHub
                  <DownloadCloud />
               </div>
               {projects
                  ?.filter((p) => !p.locally_created)
                  .map((project, index) => <ProjectCard key={index} project={project} />)}
            </div>
         )}
      </div>
   );
}

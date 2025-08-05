import BranchConventionAlertBar from "@/components/general/BranchConventionAlertBar";
import ErrorDisplay from "@/components/general/ErrorDisplay";
import Spinner from "@/components/general/Spinner";
import KanbanBoard from "@/components/screens/project-dashboard/KanbanBoard";
import ProjectControls from "@/components/screens/project-dashboard/ProjectControls";
import useGetProject from "@/hooks/backend-api-hooks/internet-independant/useGetProject";
import { useParams } from "react-router";

export default function ProjectDashboard() {
   const { projectId } = useParams();
   const { project, isLoading, errorMessage } = useGetProject(projectId as string);

   if (isLoading)
      return (
         <div className="mt-30 text-center">
            <Spinner size="lg" />
            <p className="mt-5">
               Loading project... <br />
               <small className="text-foreground/60">
                  If this takes too long, please check your internet connection.
               </small>
            </p>
         </div>
      );

   if (!project || (errorMessage && !project))
      return (
         <div className="mt-30 flex justify-center text-center">
            <ErrorDisplay error={errorMessage || "Something went wrong. Project could not be found"} />
         </div>
      );

   return (
      <div className="flex h-full flex-col">
         <div className="mb-3 flex w-full flex-col gap-3 px-3">
            <div className="flex items-center gap-2">
               <h1 className="text-xl font-bold uppercase">{project.name || projectId}</h1>

               <div className="ml-auto">
                  <ProjectControls project={project} />
               </div>
            </div>

            <ErrorDisplay error={errorMessage} />

            <BranchConventionAlertBar />
         </div>

         {project && <KanbanBoard project={project} />}
      </div>
   );
}

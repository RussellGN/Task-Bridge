import BackBtn from "@/components/general/BackBtn";
import ErrorDisplay from "@/components/general/ErrorDisplay";
import Spinner from "@/components/general/Spinner";
import useGetProject from "@/hooks/backend-api-hooks/useGetProject";
import { useParams } from "react-router";

export default function ProjectDashboard() {
   const { projectName } = useParams();
   const { project, isLoading, errorMessage } = useGetProject(projectName as string);

   return (
      <div>
         <div className="mb-5 flex items-center gap-2">
            <BackBtn path="/home?tab=all" />
            <h1 className="text-lg font-semibold italic">Project Dashboard/{projectName}</h1>
         </div>

         <ErrorDisplay containerClassName="mb-3" error={errorMessage} />

         {isLoading && (
            <div className="mb-3 text-center">
               <Spinner size="lg" />
            </div>
         )}

         {project && (
            <pre className="bg-muted text-muted-foreground max-h-[80vh] overflow-auto rounded-md p-4 text-sm">
               {JSON.stringify(project, null, 2)}
            </pre>
         )}
      </div>
   );
}

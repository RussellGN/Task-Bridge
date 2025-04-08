import ErrorDisplay from "@/components/general/ErrorDisplay";
import Spinner from "@/components/general/Spinner";
import useGetProject from "@/hooks/backend-api-hooks/useGetProject";
import { useParams } from "react-router";

export default function ProjectDashboard() {
   const { projectName } = useParams();
   const { project, isLoading, errorMessage } = useGetProject(projectName as string);

   return (
      <div>
         <h1 className="mb-5 text-lg font-semibold italic">Project Dashboard/{projectName}</h1>

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

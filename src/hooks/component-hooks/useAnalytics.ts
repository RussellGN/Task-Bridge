import { useParams } from "react-router";
import useGetProject from "../backend-api-hooks/internet-independant/useGetProject";

export default function useAnalytics() {
   const { projectId } = useParams();
   const { project, isLoading } = useGetProject(projectId);

   return {
      project,
      isLoading,
   };
}

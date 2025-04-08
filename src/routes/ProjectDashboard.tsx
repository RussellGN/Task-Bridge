import { useParams } from "react-router";

export default function ProjectDashboard() {
   const { projectName } = useParams();

   return (
      <div className="p-10">
         <h1 className="text-lg font-semibold italic">Project Dashboard/{projectName}</h1>
      </div>
   );
}

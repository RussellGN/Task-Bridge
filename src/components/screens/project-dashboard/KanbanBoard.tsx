import { Project } from "@/types/interfaces";
import KanbanColumn from "./KanbanColumn";
import { CheckCircleIcon, Search, Timer, Workflow } from "lucide-react";
import { sampleIssues } from "@/lib/sample-data";

export default function KanbanBoard({ project }: { project: Project }) {
   const columns = [
      { title: "Backlog", Icon: Timer, issues: sampleIssues },
      { title: "In Progress", Icon: Workflow, issues: sampleIssues },
      { title: "Under Review", Icon: Search, issues: sampleIssues },
      { title: "Done", Icon: CheckCircleIcon, issues: sampleIssues },
   ];

   console.log(project.id);

   return (
      <div className="grid grow grid-cols-4 gap-3">
         {columns.map((column, index) => (
            <KanbanColumn key={index} title={column.title} Icon={column.Icon} issues={column.issues} />
         ))}
      </div>
   );
}

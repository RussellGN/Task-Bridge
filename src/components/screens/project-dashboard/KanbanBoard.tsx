import { Project } from "@/types/interfaces";
import KanbanColumn from "./KanbanColumn";
import { CheckCircleIcon, Loader, Search, Timer } from "lucide-react";
import { sampleIssues } from "@/lib/sample-data";

export default function KanbanBoard({ project }: { project: Project }) {
   const columns = [
      { title: "Backlog", Icon: Timer, issues: sampleIssues, newIssueForm: true },
      { title: "In Progress", Icon: Loader, issues: sampleIssues, newIssueForm: false },
      { title: "Under Review", Icon: Search, issues: sampleIssues, newIssueForm: false },
      { title: "Done", Icon: CheckCircleIcon, issues: sampleIssues, newIssueForm: false },
   ];

   return (
      <div className="grid grow grid-cols-4 gap-3">
         {columns.map((column, index) => (
            <KanbanColumn
               project={project}
               key={index}
               title={column.title}
               Icon={column.Icon}
               newIssueForm={column.newIssueForm}
               issues={column.issues}
            />
         ))}
      </div>
   );
}

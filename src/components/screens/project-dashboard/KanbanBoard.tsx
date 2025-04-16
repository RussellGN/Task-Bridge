import { Project } from "@/types/interfaces";
import KanbanColumn from "./KanbanColumn";
import { CheckCircleIcon, Loader, Search, Timer } from "lucide-react";
import { sampleTasks } from "@/lib/sample-data";

export default function KanbanBoard({ project }: { project: Project }) {
   const columns = [
      { title: "Backlog", Icon: Timer, tasks: sampleTasks, newTaskForm: true },
      { title: "In Progress", Icon: Loader, tasks: sampleTasks, newTaskForm: false },
      { title: "Under Review", Icon: Search, tasks: sampleTasks, newTaskForm: false },
      { title: "Done", Icon: CheckCircleIcon, tasks: sampleTasks, newTaskForm: false },
   ];

   return (
      <div className="grid grow grid-cols-4 gap-3">
         {columns.map((column, index) => (
            <KanbanColumn
               project={project}
               key={index}
               title={column.title}
               Icon={column.Icon}
               newTaskForm={column.newTaskForm}
               tasks={column.tasks}
            />
         ))}
      </div>
   );
}

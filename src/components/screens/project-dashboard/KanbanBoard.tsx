import { Project } from "@/types/interfaces";
import KanbanColumn from "./KanbanColumn";
import { CheckCircleIcon, Loader, Search, Timer } from "lucide-react";

export default function KanbanBoard({ project }: { project: Project }) {
   const columns = [
      { title: "Backlog", Icon: Timer, tasks: project.tasks || [], newTaskForm: true },
      { title: "In Progress", Icon: Loader, tasks: project.tasks || [], newTaskForm: false },
      { title: "Under Review", Icon: Search, tasks: project.tasks || [], newTaskForm: false },
      { title: "Done", Icon: CheckCircleIcon, tasks: project.tasks || [], newTaskForm: false },
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

import { Project } from "@/types/interfaces";
import KanbanColumn from "./KanbanColumn";
import useKanbanBoard from "@/hooks/component-hooks/useKanbanBoard";

export default function KanbanBoard({ project }: { project: Project }) {
   const { columns } = useKanbanBoard(project);
   console.log(columns);
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
               draftTasks={column.draftTasks}
            />
         ))}
      </div>
   );
}

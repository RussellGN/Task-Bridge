import { DraftTask, Project, Task } from "@/types/interfaces";
import { LucideIcon } from "lucide-react";
import KanbanTaskCard from "./KanbanTaskCard";
import NewTaskForm from "./NewTaskForm";
import KanbanDraftTaskCard from "./KanbanDraftTaskCard";

type KanbanColumnProps = {
   project: Project;
   title: string;
   Icon: LucideIcon;
   tasks: Task[];
   draftTasks: DraftTask[];
   newTaskForm?: boolean;
};

export default function KanbanColumn({ project, title, Icon, tasks, newTaskForm, draftTasks }: KanbanColumnProps) {
   return (
      <div className="bg-foreground/10 border-foreground flex h-full max-h-[85vh] flex-col gap-3 rounded-lg border p-4 shadow-lg">
         <h2 className="flex items-center gap-2 border-b-2 pb-2 font-semibold">
            <Icon className="text-PRIMARY stroke-3" />
            <span>{title}</span>
            <span className="text-PRIMARY border-PRIMARY bg-background ml-auto block rounded-md border px-2 text-lg font-bold">
               {tasks.length}
            </span>
         </h2>

         <div className="flex grow flex-col gap-3 overflow-y-auto pr-1">
            {draftTasks.map((draft, index) => (
               <div key={index} className="w-full">
                  <KanbanDraftTaskCard draft={draft} />
               </div>
            ))}
            {tasks.map((task, index) => (
               <div key={index} className="w-full">
                  <KanbanTaskCard task={task} />
               </div>
            ))}
         </div>

         {newTaskForm && (
            <NewTaskForm
               tasks={project.tasks || []}
               drafts={project.draft_tasks || []}
               team={project.team}
               pendingTeam={project.pending_invites}
            />
         )}
      </div>
   );
}

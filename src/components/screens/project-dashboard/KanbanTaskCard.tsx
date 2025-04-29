import { UserAvatar } from "@/components/general/UserAvatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Task } from "@/types/interfaces";
import { ChevronsDown, ChevronsUp, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";
import PriorityIndicator from "./PriorityIndicator";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useKanbanTaskCard from "@/hooks/component-hooks/useKanbanTaskCard";

export default function KanbanTaskCard({ task }: { task: Task }) {
   const { open, toggleOpen, editTask, deleteTask } = useKanbanTaskCard(task);

   return (
      <div className="bg-background border-foreground/40 relative rounded-md border px-2 py-3 shadow">
         <Collapsible open={open} onOpenChange={toggleOpen}>
            <div className={`flex ${open ? "items-start" : "items-center"} justify-between gap-2`}>
               <CollapsibleTrigger
                  className={`hover:text-foreground/100 text-foreground/90 flex grow cursor-pointer items-start gap-1 text-left text-sm transition-all`}
               >
                  <div className="w-fit">
                     {open ? (
                        <ChevronsUp className="text-PRIMARY mt-0.5" />
                     ) : (
                        <ChevronsDown className="text-PRIMARY mt-0.5" />
                     )}
                  </div>
                  <span className={open ? "" : "line-clamp-1"}>
                     <span className="text-PRIMARY">{task.innerIssue.number}.</span> {task.innerIssue.title}
                  </span>
               </CollapsibleTrigger>

               <div className="flex items-center gap-1">
                  <PriorityIndicator priority={task.priority} />

                  {task.innerIssue.assignee && (
                     <Link to={task.innerIssue.assignee.html_url}>
                        <UserAvatar user={task.innerIssue.assignee} className="size-5" />
                     </Link>
                  )}

                  <DropdownMenu>
                     <DropdownMenuTrigger
                        asChild
                        className="hover:text-foreground/100 text-foreground/80 cursor-pointer"
                     >
                        <EllipsisVertical />
                     </DropdownMenuTrigger>

                     <DropdownMenuContent side="right" align="start" className="border-foreground border">
                        <DropdownMenuItem onClick={editTask}>
                           <Pencil />
                           Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteTask}>
                           <Trash2 />
                           Delete
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>

            <CollapsibleContent className="bg-foreground/10 border-foreground/40 mt-2 rounded-sm border p-2 text-sm">
               <p>{task.innerIssue.body || "no description"}</p>
            </CollapsibleContent>
         </Collapsible>
      </div>
   );
}

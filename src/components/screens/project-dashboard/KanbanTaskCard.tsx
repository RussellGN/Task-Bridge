import { UserAvatar } from "@/components/general/UserAvatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Project, Task } from "@/types/interfaces";
import { ArrowRight, ChevronsDown, ChevronsUp, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import PriorityIndicator from "./PriorityIndicator";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useKanbanTaskCard from "@/hooks/component-hooks/useKanbanTaskCard";
import { AssigneesAvatars } from "@/components/general/AssigneesAvatars";
import InfoTooltip from "@/components/general/InfoTooltip";
import { cn } from "@/lib/utils";
import SpinnerIcon from "@/components/general/SpinnerIcon";
import TaskTimeline from "./TaskTimeline";

export default function KanbanTaskCard({ task, project }: { task: Task; project: Project }) {
   const { open, isPending, isActivitySyncing, assignNow, toggleOpen, editTask, deleteTask, syncActivity } =
      useKanbanTaskCard(task, project);

   return (
      <div
         className={cn(
            "bg-background border-foreground/40 hover:border-foreground/70 relative rounded-md border p-1 shadow transition-all",
            isPending && "pointer-events-none opacity-50",
         )}
      >
         <Collapsible open={open} onOpenChange={toggleOpen}>
            <div className={`flex ${open ? "items-start" : "items-center"} justify-between gap-3 p-2`}>
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
                     <span className="text-PRIMARY">{task.inner_issue.number}.</span> {task.inner_issue.title}
                  </span>
               </CollapsibleTrigger>

               <div className="flex items-center gap-2">
                  {task.inner_issue.assignees?.length > 1 ? (
                     <AssigneesAvatars assignees={task.inner_issue.assignees} />
                  ) : task.inner_issue.assignee ? (
                     <InfoTooltip
                        trigger={<UserAvatar user={task.inner_issue.assignee} className="size-5" />}
                        content={
                           <>
                              Assigned to <b>{task.inner_issue.assignee.login} </b>
                           </>
                        }
                     />
                  ) : (
                     ""
                  )}

                  <PriorityIndicator priority={task.priority} className="ml-1" />

                  {isPending || isActivitySyncing ? (
                     <SpinnerIcon />
                  ) : (
                     <DropdownMenu>
                        <DropdownMenuTrigger
                           disabled={isPending}
                           asChild
                           className="hover:text-foreground/100 text-foreground/80 cursor-pointer"
                        >
                           <EllipsisVertical />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent side="right" align="start" className="border-foreground/50 border">
                           {task.is_backlog && task.inner_issue.assignee && (
                              <DropdownMenuItem onClick={assignNow}>
                                 <ArrowRight />
                                 Assign now
                              </DropdownMenuItem>
                           )}

                           {task.inner_issue.state === "open" && (
                              <DropdownMenuItem onClick={editTask}>
                                 <Pencil />
                                 Edit
                              </DropdownMenuItem>
                           )}
                           <DropdownMenuItem onClick={deleteTask}>
                              <Trash2 />
                              Delete
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  )}
               </div>
            </div>

            <CollapsibleContent>
               <div className="flex flex-1 flex-col gap-0.5 text-xs">
                  <p className="bg-foreground/15 border-foreground/25 text-sml rounded-sm border px-2 py-1">
                     {task.inner_issue.body || "No description"}
                  </p>
                  {task.commits?.length ? (
                     <TaskTimeline task={task} className="bg-foreground/15" syncActivity={syncActivity} />
                  ) : (
                     ""
                  )}
               </div>
            </CollapsibleContent>
         </Collapsible>
      </div>
   );
}

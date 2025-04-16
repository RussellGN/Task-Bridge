import { UserAvatar } from "@/components/general/UserAvatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Issue } from "@/types/interfaces";
import { ChevronsDown, ChevronsUp, EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function KanbanTaskCard({ task }: { task: Issue }) {
   const [open, setOpen] = useState(false);
   const toggleOpen = () => setOpen((prev) => !prev);

   return (
      <div className="bg-background border-PRIMARY rounded-md border-l-2 p-3 shadow">
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
                  <span className={open ? "" : "line-clamp-1"}>{task.title}</span>
               </CollapsibleTrigger>

               <div className="flex items-center gap-1">
                  <Link to={task.assignee!.html_url}>
                     <UserAvatar user={task.assignee!} className="size-5" />
                  </Link>

                  <Button variant="ghost" size="icon" className="size-5 cursor-pointer">
                     <EllipsisVertical />
                  </Button>
               </div>
            </div>

            <CollapsibleContent className="bg-foreground/5 mt-2 rounded-sm border-t-1 px-1 py-2 text-xs">
               <p>{task.body || "no description"}</p>
            </CollapsibleContent>
         </Collapsible>
      </div>
   );
}

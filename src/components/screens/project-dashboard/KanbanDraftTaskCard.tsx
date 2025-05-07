import { UserAvatar } from "@/components/general/UserAvatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DraftTask } from "@/types/interfaces";
import { ArrowRight, ChevronsDown, ChevronsUp, EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import PriorityIndicator from "./PriorityIndicator";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useKanbanDraftTaskCard from "@/hooks/component-hooks/useKanbanDraftTaskCard";

export default function KanbanDraftTaskCard({ draft }: { draft: DraftTask }) {
   const { open, assignNow, toggleOpen, editDraft, deleteDraft } = useKanbanDraftTaskCard(draft);

   return (
      <div className="bg-background border-foreground/40 hover:border-foreground/70 relative rounded-md border p-1 shadow transition-all">
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
                     <span className="text-foreground/50 border-foreground/30 rounded-sm border px-1 text-xs italic">
                        Draft
                     </span>{" "}
                     {draft.title}
                  </span>
               </CollapsibleTrigger>

               <div className="flex items-center gap-2">
                  {draft.assignee && <UserAvatar user={draft.assignee} className="size-5" />}

                  <PriorityIndicator priority={draft.priority || undefined} className="ml-1" />

                  <DropdownMenu>
                     <DropdownMenuTrigger
                        asChild
                        className="hover:text-foreground/100 text-foreground/80 cursor-pointer"
                     >
                        <EllipsisVertical />
                     </DropdownMenuTrigger>

                     <DropdownMenuContent side="right" align="start" className="border-foreground/50 border">
                        {draft.assignee && (
                           <DropdownMenuItem onClick={assignNow}>
                              <ArrowRight />
                              Assign now
                           </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={editDraft}>
                           <Pencil />
                           Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={deleteDraft}>
                           <Trash2 />
                           Delete
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>

            <CollapsibleContent className="bg-foreground/20 rounded-sm px-2 py-1 text-sm">
               <p>{draft.body || "no description"}</p>
            </CollapsibleContent>
         </Collapsible>
      </div>
   );
}

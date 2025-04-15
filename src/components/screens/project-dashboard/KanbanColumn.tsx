import { Issue } from "@/types/interfaces";
import { LucideIcon } from "lucide-react";
import KanbanIssueCard from "./KanbanIssueCard";

type KanbanColumnProps = {
   title: string;
   Icon: LucideIcon;
   issues: Issue[];
};

export default function KanbanColumn({ title, Icon, issues }: KanbanColumnProps) {
   return (
      <div className="bg-foreground/10 flex h-full flex-col gap-3 rounded-lg p-4 shadow-lg">
         <h2 className="flex items-center gap-2 border-b-2 pb-2 font-semibold">
            <Icon className="text-PRIMARY stroke-3" />
            <span>{title}</span>
            <span className="text-PRIMARY border-PRIMARY bg-background ml-auto block rounded-md border px-2 text-lg font-bold">
               {issues.length}
            </span>
         </h2>

         <div className="flex grow flex-col gap-3 overflow-y-auto">
            {issues.map((issue) => (
               <div key={issue.id} className="w-full">
                  <KanbanIssueCard issue={issue} />
               </div>
            ))}
         </div>
      </div>
   );
}

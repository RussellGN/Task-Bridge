import { getTimeElapsedSince } from "@/lib/utils";
import { Task } from "@/types/interfaces";
import { ChartNoAxesCombined, Clock, Dot } from "lucide-react";

export default function TaskTimeline({ task }: { task: Task }) {
   return (
      <div className="bg-foreground/10 border-foreground/25 mt-1 flex flex-1 flex-col gap-1.5 rounded-sm border px-2 py-1">
         <div className="flex items-center gap-1 pb-1 text-xs font-semibold">
            Activity <ChartNoAxesCombined />
            <div className="ml-auto">35</div>
         </div>

         <ul className="flex max-h-32 flex-col gap-1 overflow-y-auto pr-2">
            {task.commits?.map((commit) => (
               <li key={commit.sha} className="flex items-center gap-1 text-xs">
                  <div className="line-clamp-1 pr-4">
                     <Dot className="lucide-exempt mr-1 inline-block" size={12} />
                     {commit.commit.message}
                  </div>

                  {commit.commit.committer.date ||
                     (commit.commit.author.date && (
                        <div className="text-foreground/50 ml-auto flex items-center gap-1 text-nowrap">
                           <Clock className="lucide-exempt" size={12} />
                           {getTimeElapsedSince(commit.commit.committer.date || commit.commit.author.date)}
                        </div>
                     ))}
               </li>
            ))}
         </ul>
      </div>
   );
}

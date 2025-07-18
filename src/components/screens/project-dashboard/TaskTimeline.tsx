import { Button } from "@/components/ui/button";
import { cn, getTimeElapsedSince } from "@/lib/utils";
import { Commit, Task } from "@/types/interfaces";
import { Clock, RotateCw } from "lucide-react";

type TaskTimelineProps = {
   task: Task;
   className?: string;
   syncActivity: () => void;
};

export default function TaskTimeline({ task, className, syncActivity }: TaskTimelineProps) {
   const uniqueCommits = new Map<string, Commit>();
   task.commits?.forEach((commit) => {
      if (!uniqueCommits.has(commit.sha)) {
         uniqueCommits.set(commit.sha, commit);
      }
   });
   const commits = Array.from(uniqueCommits.values()).sort((a, b) => {
      const dateA = a.commit.committer.date || a.commit.author.date || new Date();
      const dateB = b.commit.committer.date || b.commit.author.date || new Date();
      return new Date(dateB).getTime() - new Date(dateA).getTime();
   });

   return (
      <div
         className={cn(
            "bg-foreground/10 border-foreground/25 mt-1 flex flex-1 flex-col gap-1.5 rounded-sm border px-2 py-1",
            className,
         )}
      >
         <div className="text-PRIMARY flex items-center justify-between gap-1 text-xs font-semibold">
            Activity
            <Button variant="link" className="text-foreground cursor-pointer text-xs" size="sm" onClick={syncActivity}>
               Refresh
               <RotateCw className="lucide-exempt" />
            </Button>
         </div>

         <ul className="flex max-h-32 flex-col gap-1 overflow-y-auto pr-2">
            {commits.map((commit) => {
               const date = commit.commit.committer.date || commit.commit.author.date;
               return (
                  <li key={commit.sha} className="flex items-center gap-1 text-xs">
                     <div title={commit.commit.message} className="line-clamp-1 pr-4">
                        {commit.commit.message}
                     </div>

                     {date && (
                        <div className="text-foreground/50 ml-auto flex items-center gap-1 text-nowrap">
                           <Clock className="lucide-exempt" size={12} />
                           {getTimeElapsedSince(date)}
                        </div>
                     )}
                  </li>
               );
            })}
         </ul>
      </div>
   );
}

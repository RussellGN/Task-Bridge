import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TaskPriority } from "@/types/types";

type PriorityIndicatorProps = {
   className?: string;
   priority?: TaskPriority;
};

export default function PriorityIndicator({ priority, className }: PriorityIndicatorProps) {
   const bg =
      priority === "urgent"
         ? "bg-red-500"
         : priority === "high"
           ? "bg-yellow-500"
           : priority === "normal"
             ? "bg-green-500"
             : "bg-grey-500";

   if (bg === "bg-grey-500" && priority !== "low") return null;

   return (
      <TooltipProvider>
         <Tooltip>
            <TooltipTrigger className={cn("mx-1 inline-block size-2 rounded-full", bg, className)}></TooltipTrigger>
            <TooltipContent>
               <p>{priority} priority</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   );
}

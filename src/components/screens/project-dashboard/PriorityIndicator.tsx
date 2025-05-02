import InfoTooltip from "@/components/general/InfoTooltip";
import { cn } from "@/lib/utils";
import { TaskPriority } from "@/types/types";

type PriorityIndicatorProps = {
   className?: string;
   priority?: TaskPriority;
};

export default function PriorityIndicator({ priority, className }: PriorityIndicatorProps) {
   const bg =
      priority === "urgent"
         ? "bg-DANGER"
         : priority === "high"
           ? "bg-WARNING"
           : priority === "normal"
             ? "bg-SUCCESS"
             : "bg-foreground";

   if (bg === "bg-foreground" && priority !== "low") return null;

   return (
      <InfoTooltip
         trigger={<div className={cn("block size-2 rounded-full", bg, className)} />}
         content={<>{priority} - priority</>}
      />
   );
}

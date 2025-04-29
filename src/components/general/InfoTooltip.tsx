import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type InfoTooltipProps = {
   content: ReactNode;
   className?: string;
   TriggerIcon?: LucideIcon;
   trigger?: ReactNode;
   iconSize?: number;
   align?: "start" | "center" | "end";
   side?: "top" | "bottom" | "left" | "right";
};

export default function InfoTooltip({
   content,
   className,
   trigger,
   TriggerIcon,
   iconSize,
   align,
   side,
}: InfoTooltipProps) {
   const Icon = TriggerIcon || Info;
   return (
      <TooltipProvider>
         <Tooltip>
            <TooltipTrigger>
               {trigger ? (
                  trigger
               ) : (
                  <Icon
                     size={iconSize || 18}
                     className={cn("hover:text-PRIMARY text-PRIMARY/80 transition-colors", className)}
                  />
               )}
            </TooltipTrigger>
            <TooltipContent align={align} side={side}>
               <p>{content}</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   );
}

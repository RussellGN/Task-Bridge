import { MAX_ERR_LENGTH } from "@/lib/constants";
import { cn, trimFunctionNameFromLog, truncateStr } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type ErrorDisplayProps = {
   error: string | null | undefined;
   containerClassName?: string;
   textClassName?: string;
   lightError?: boolean;
};

export default function ErrorDisplay({ error, containerClassName, textClassName, lightError }: ErrorDisplayProps) {
   if (!error) return;
   error = trimFunctionNameFromLog(error);
   return (
      <div className={containerClassName}>
         <p className={cn("text-DANGER flex items-start gap-2", lightError && "text-foreground", textClassName)}>
            <span className="inline-block w-fit pt-1">
               <AlertTriangle />
            </span>
            <span>{truncateStr(error, MAX_ERR_LENGTH)}</span>
         </p>
      </div>
   );
}

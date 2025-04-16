import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type ErrorDisplayProps = {
   error: string | null | undefined;
   containerClassName?: string;
   textClassName?: string;
};

export default function ErrorDisplay({ error, containerClassName, textClassName }: ErrorDisplayProps) {
   if (!error) return;
   return (
      <div className={containerClassName}>
         <p className={cn("text-DANGER flex items-start gap-2", textClassName)}>
            <span className="inline-block w-fit pt-1">
               <AlertTriangle />
            </span>
            <span>{error}</span>
         </p>
      </div>
   );
}

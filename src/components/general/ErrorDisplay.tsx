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
         <p className={cn("text-DANGER flex items-center gap-1", textClassName)}>
            <AlertTriangle className="-mb-0.5" size={17} />
            {error}
         </p>
      </div>
   );
}

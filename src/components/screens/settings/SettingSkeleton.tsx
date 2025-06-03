import { Setting } from "@/types/interfaces";
import { Info } from "lucide-react";

export default function SettingSkeleton({ title, description, children }: Setting) {
   return (
      <div className="mb-10">
         <div className="mb-2 font-semibold">{title}</div>

         <p className="text-foreground/70 mb-4 max-w-prose text-sm">
            <Info className="text-PRIMARY/80 mr-1 mb-1 inline-block" />
            {description}
         </p>

         <div>{children}</div>
      </div>
   );
}

import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

export default function SpinnerIcon({ className }: { className?: string }) {
   return <RotateCcw className={cn("animate-spin", className)} />;
}

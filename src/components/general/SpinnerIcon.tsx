import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";

export default function SpinnerIcon({ className }: { className?: string }) {
   return <RotateCw className={cn("animate-spin", className)} />;
}

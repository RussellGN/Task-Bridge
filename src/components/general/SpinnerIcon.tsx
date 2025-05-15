import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

export default function SpinnerIcon({ className }: { className?: string }) {
   return <LoaderCircle className={cn("animate-spin", className)} />;
}

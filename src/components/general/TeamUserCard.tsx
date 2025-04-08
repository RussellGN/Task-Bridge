import { AuthorInterface } from "@/types/interfaces";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TeamUserCardProps = {
   user: AuthorInterface;
   onRemove?: () => void;
   className?: string;
};

export default function TeamUserCard({ user, className, onRemove }: TeamUserCardProps) {
   return (
      <div className={cn("bg-foreground/5 flex items-center gap-2 rounded-sm border px-2 py-0.5 text-xs", className)}>
         <img src={user.avatar_url} alt={user.login} className="size-6 rounded-full" />

         <div className="flex flex-col">
            <p className="font-semibold">{user.login}</p>
            <p className="text-foreground/50">{user.email || "no public email"}</p>
         </div>

         {onRemove && (
            <Button onClick={onRemove} variant="link" type="button" size="icon">
               <X />
            </Button>
         )}
      </div>
   );
}

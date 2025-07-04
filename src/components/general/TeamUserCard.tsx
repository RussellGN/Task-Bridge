import { Author } from "@/types/interfaces";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

type TeamUserCardProps = {
   user: Author;
   onRemove?: () => void;
   className?: string;
   pending?: boolean;
   showPendingState?: boolean;
};

export default function TeamUserCard({ user, pending, className, showPendingState, onRemove }: TeamUserCardProps) {
   return (
      <div className={cn("bg-foreground/5 flex items-center gap-2 rounded-sm border px-2 py-0.5 text-xs", className)}>
         <UserAvatar
            user={user}
            className={`size-6 ${showPendingState ? "border-3" : "border-0"} ${pending ? "border-[grey]" : "border-PRIMARY"}`}
         />

         <div className="font-semibold">{user.login}</div>

         {onRemove && (
            <Button onClick={onRemove} variant="link" type="button" size="icon">
               <X />
            </Button>
         )}
      </div>
   );
}

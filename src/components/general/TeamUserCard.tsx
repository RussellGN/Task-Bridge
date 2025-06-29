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
};

export default function TeamUserCard({ user, pending, className, onRemove }: TeamUserCardProps) {
   return (
      <div className={cn("bg-foreground/5 flex items-center gap-2 rounded-sm border px-2 py-0.5 text-xs", className)}>
         <UserAvatar user={user} className={`size-6 border-3 ${pending ? "border-[grey]" : "border-PRIMARY"}`} />

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

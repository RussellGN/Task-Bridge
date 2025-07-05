import { Author } from "@/types/interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Users } from "lucide-react";

type AssigneesAvatarsProps = {
   assignees: Author[];
   triggerClassName?: string;
   contentClassName?: string;
   avatarClassName?: string;
};

export function AssigneesAvatars({
   assignees,
   triggerClassName,
   contentClassName,
   avatarClassName,
}: AssigneesAvatarsProps) {
   return (
      <HoverCard openDelay={0} closeDelay={0}>
         <HoverCardTrigger
            className={cn(
               "hover:text-foreground text-foreground/90 flex size-fit items-center gap-1 text-sm transition-all",
               triggerClassName,
            )}
         >
            {assignees.length}
            <span className="w-fit">
               <Users className="lucide-exempt size-[13px]" />
            </span>
         </HoverCardTrigger>

         <HoverCardContent
            side="top"
            className={cn(
               "bg-foreground text-background max-h-40 w-fit overflow-y-auto p-2 shadow-lg",
               contentClassName,
            )}
         >
            {assignees.map((user) => (
               <div key={user.login} className="flex items-center gap-1 py-1">
                  <Avatar className={cn("border-background size-5 border", avatarClassName)}>
                     <AvatarImage src={user.avatar_url} />
                     <AvatarFallback>{user.login.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-xs">{user.login}</div>
               </div>
            ))}
         </HoverCardContent>
      </HoverCard>
   );
}

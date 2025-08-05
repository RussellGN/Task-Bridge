import { Author } from "@/types/interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function UserAvatar({ user, className }: { user: Author; className?: string }) {
   return (
      <Avatar className={cn("bg-card border-foreground/30 border", className)}>
         <AvatarImage src={user.avatar_url} />
         <AvatarFallback className="">{user.login.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
   );
}

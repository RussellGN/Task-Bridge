import { Author, User } from "@/types/interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({ user, className }: { user: User | Author; className?: string }) {
   return (
      <Avatar className={className}>
         <AvatarImage src={user.avatar_url} />
         <AvatarFallback>{user.login.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
   );
}

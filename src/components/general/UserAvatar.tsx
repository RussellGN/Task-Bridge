import { Author, User } from "@/types/interfaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({ user }: { user: User | Author; className?: string }) {
   return (
      <Avatar>
         <AvatarImage src={user.avatar_url} />
         <AvatarFallback>{user.login.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
   );
}

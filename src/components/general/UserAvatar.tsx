import { UserInterface } from "@/lib/interfaces";
import { cn } from "@/lib/utils";

export function UserAvatar({ user, className }: { user: UserInterface; className?: string }) {
   return (
      <img
         src={user.avatar_url}
         alt={`${user.login}'s profile`}
         className={cn("size-10 shadow-md rounded-full bg-black", className)}
      />
   );
}

import { UserInterface } from "@/lib/interfaces";
import { Button } from "../ui/button";
import { X } from "lucide-react";

export default function TeamUserCard({ user, onRemove }: { user: UserInterface; onRemove: () => void }) {
   return (
      <div className="bg-foreground/5 flex items-center gap-2 rounded-sm border px-2 py-0.5 text-xs">
         <img src={user.avatar_url} alt={user.login} className="size-6 rounded-full" />

         <div className="flex flex-col">
            <p className="font-semibold">{user.login}</p>
            <p className="text-foreground/50">{user.email || "n\\a"}</p>
         </div>

         <Button onClick={onRemove} variant="link" type="button" size="icon">
            <X />
         </Button>
      </div>
   );
}

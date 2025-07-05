import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAccountManager from "@/hooks/component-hooks/useAccountManager";
import MenuBarItem from "./MenuBarItem";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import { LogOut, User } from "lucide-react";

export function AccountManager() {
   const { user, showSignoutDialog, signout, setShowSignoutDialog } = useAccountManager();

   if (!user) {
      return (
         <MenuBarItem disabled Icon={User} className="cursor-not-allowed">
            Account
         </MenuBarItem>
      );
   }

   return (
      <>
         <Dialog open={showSignoutDialog} onOpenChange={setShowSignoutDialog}>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Sign Out & Clear Data</DialogTitle>
                  <DialogDescription>
                     Are you sure you want to sign out? This will clear all your data and settings on the app.
                  </DialogDescription>
               </DialogHeader>

               <DialogFooter>
                  <DialogClose asChild>
                     <Button variant="outline">Cancel</Button>
                  </DialogClose>

                  <Button onClick={signout}>
                     Signout
                     <LogOut />
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <MenuBarItem>
                  <UserAvatar user={user} className="border-PRIMARY size-4 border-2" />
                  {user.login}
               </MenuBarItem>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="start">
               <DropdownMenuItem asChild>
                  <Link target="_blank" to={user.html_url || "https://www.github.com"}>
                     Open GitHub
                  </Link>
               </DropdownMenuItem>

               <DropdownMenuItem onClick={() => setShowSignoutDialog(true)}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </>
   );
}

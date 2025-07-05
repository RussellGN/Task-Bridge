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
import { Loader2, LogOut } from "lucide-react";
import SpinnerIcon from "./SpinnerIcon";

export function AccountManager() {
   const { user, isSigningOut, userLoading, showSignoutDialog, signout, setShowSignoutDialog } = useAccountManager();

   if (userLoading) {
      return (
         <MenuBarItem disabled Icon={Loader2} iconClassName="animate-spin" className="cursor-not-allowed">
            Account
         </MenuBarItem>
      );
   }

   if (!user) return;

   return (
      <>
         <Dialog open={showSignoutDialog} onOpenChange={isSigningOut ? undefined : setShowSignoutDialog}>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Sign Out & Clear Data</DialogTitle>
                  <DialogDescription>
                     Are you sure you want to sign out? This will clear all your data and settings on the app.
                  </DialogDescription>
               </DialogHeader>

               <DialogFooter>
                  <DialogClose disabled={isSigningOut} asChild>
                     <Button variant="outline">Cancel</Button>
                  </DialogClose>

                  <Button disabled={isSigningOut} onClick={signout}>
                     {isSigningOut ? (
                        <>
                           Signing out...
                           <SpinnerIcon />
                        </>
                     ) : (
                        <>
                           Sign Out
                           <LogOut />
                        </>
                     )}
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

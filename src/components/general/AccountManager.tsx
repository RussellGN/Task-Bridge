import { MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import useAccountManager from "@/hooks/component-hooks/useAccountManager";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import { Loader2, LogOut } from "lucide-react";
import SpinnerIcon from "./SpinnerIcon";

export function AccountManager() {
   const { user, isSigningOut, userLoading, showSignoutDialog, signout, setShowSignoutDialog } = useAccountManager();

   if (userLoading) {
      return (
         <>
            <MenubarMenu>
               <MenubarTrigger
                  disabled
                  className="flex cursor-not-allowed items-center gap-1.5 opacity-50 hover:border-transparent hover:bg-transparent"
               >
                  <Loader2 className="mt-0.5 size-3.5 animate-spin" />
                  Account
               </MenubarTrigger>
            </MenubarMenu>
         </>
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

         <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1.5">
               <UserAvatar user={user} className="border-PRIMARY mt-0.5 size-3.5 border-2" />
               {user.login}
            </MenubarTrigger>

            <MenubarContent>
               <MenubarItem asChild>
                  <Link target="_blank" to={user.html_url || "https://www.github.com"}>
                     Open GitHub
                  </Link>
               </MenubarItem>

               <MenubarItem onClick={() => setShowSignoutDialog(true)}>Sign Out</MenubarItem>
            </MenubarContent>
         </MenubarMenu>
      </>
   );
}

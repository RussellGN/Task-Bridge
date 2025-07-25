import {
   Menubar,
   MenubarContent,
   MenubarItem,
   MenubarMenu,
   MenubarSeparator,
   MenubarShortcut,
   MenubarTrigger,
} from "@/components/ui/menubar";
import { AccountManager } from "./AccountManager";

export default function MenuBar() {
   return (
      <>
         <div className="bg-DANGER flex px-3 md:px-5 lg:px-8">
            <div className="bg-SUCCESS">
               <AccountManager />
            </div>
         </div>

         <Menubar className="bg-PRIMARY">
            <MenubarMenu>
               <MenubarTrigger>File</MenubarTrigger>

               <MenubarContent>
                  <MenubarItem>
                     New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>New Window</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Share</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Print</MenubarItem>
               </MenubarContent>
            </MenubarMenu>
         </Menubar>
      </>
   );
}

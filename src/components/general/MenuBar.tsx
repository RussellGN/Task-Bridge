import { Menubar } from "@/components/ui/menubar";
import { AccountManager } from "./AccountManager";
import MenuBarLinkItem from "./MenuBarLinkItem";
import { HelpCircle, HomeIcon, Settings } from "lucide-react";

export default function MenuBar() {
   return (
      <Menubar>
         <MenuBarLinkItem to="/home" Icon={HomeIcon}>
            Home
         </MenuBarLinkItem>
         <AccountManager />
         <MenuBarLinkItem to="/help" Icon={HelpCircle}>
            Help
         </MenuBarLinkItem>
         <MenuBarLinkItem to="/settings" Icon={Settings}>
            Settings
         </MenuBarLinkItem>
      </Menubar>
   );
}

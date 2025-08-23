import { Menubar } from "@/components/ui/menubar";
import { AccountManager } from "./AccountManager";
import MenuBarLinkItem from "./MenuBarLinkItem";
import { HelpCircle, HomeIcon, Settings } from "lucide-react";
import { useLocation } from "react-router";
import MenuBarBackBtn from "./MenuBarBackBtn";

export default function MenuBar() {
   const location = useLocation();

   if (location.pathname.replace("/", "") === "") return null;

   return (
      <Menubar>
         <MenuBarBackBtn />
         <MenuBarLinkItem to="/projects" Icon={HomeIcon}>
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

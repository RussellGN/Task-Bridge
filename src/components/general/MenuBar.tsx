import { Menubar } from "@/components/ui/menubar";
import { AccountManager } from "./AccountManager";
import MenuBarLinkItem from "./MenuBarLinkItem";
import { HelpCircle } from "lucide-react";

export default function MenuBar() {
   return (
      <Menubar>
         <AccountManager />
         <MenuBarLinkItem to="/help" Icon={HelpCircle}>
            Help
         </MenuBarLinkItem>
      </Menubar>
   );
}

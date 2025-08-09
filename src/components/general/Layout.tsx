import { Outlet } from "react-router";
import useListenForAuthSetupCompleteEvent from "@/hooks/useListenForAuthSetupCompleteEvent";
import DevKit from "./DevKit";
import { Toaster } from "@/components/ui/sonner";
import MenuBar from "./MenuBar";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Layout() {
   useListenForAuthSetupCompleteEvent();
   return (
      <div className="flex h-screen flex-col overflow-hidden">
         <MenuBar />
         <div className="grow p-3 pt-2 md:p-5 md:pt-2 lg:p-8 lg:pt-2">
            <Outlet />
            <Toaster
               expand
               closeButton
               icons={{
                  error: <AlertTriangle className="text-DANGER stroke-3" />,
                  success: <CheckCircle2 className="text-SUCCESS stroke-3" />,
               }}
               swipeDirections={[]}
               duration={30000}
            />
            <DevKit />
         </div>
      </div>
   );
}

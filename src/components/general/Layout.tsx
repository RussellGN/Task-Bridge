import { Outlet } from "react-router";
import useListenForAuthSetupCompleteEvent from "@/hooks/useListenForAuthSetupCompleteEvent";
import DevKit from "./DevKit";
import { Toaster } from "@/components/ui/sonner";
import MenuBar from "./MenuBar";

export default function Layout() {
   useListenForAuthSetupCompleteEvent();

   return (
      <div className="flex h-screen flex-col overflow-hidden">
         <MenuBar />
         <div className="grow p-3 pt-2 md:p-5 md:pt-2 lg:p-8 lg:pt-2">
            <Outlet />
            <Toaster expand />
            <DevKit />
         </div>
      </div>
   );
}

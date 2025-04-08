import { Outlet } from "react-router";
import useListenForAuthSetupCompleteEvent from "@/hooks/useListenForAuthSetupCompleteEvent";
import DevKit from "./DevKit";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
   useListenForAuthSetupCompleteEvent();

   return (
      <div className="h-screen p-3 md:p-5 lg:p-8">
         <Outlet />
         <Toaster />
         <DevKit />
      </div>
   );
}

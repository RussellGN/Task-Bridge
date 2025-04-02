import { Outlet } from "react-router";
import useListenForAuthSetupCompleteEvent from "@/hooks/useListenForAuthSetupCompleteEvent";
import DevKit from "./DevKit";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
   useListenForAuthSetupCompleteEvent();

   return (
      <div>
         <Outlet />
         <Toaster />
         <DevKit />
      </div>
   );
}

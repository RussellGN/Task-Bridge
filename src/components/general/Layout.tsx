import { Outlet } from "react-router";
import useEventListeners from "@/hooks/useEventListeners";
import DevKit from "./DevKit";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
   useEventListeners();

   return (
      <div>
         <Outlet />
         <Toaster />
         <DevKit />
      </div>
   );
}

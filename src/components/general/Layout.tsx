import { Outlet } from "react-router";
import useEventListeners from "@/hooks/useEventListeners";
import DevKit from "./DevKit";

export default function Layout() {
   useEventListeners();

   return (
      <div>
         <Outlet />
         <DevKit />
      </div>
   );
}

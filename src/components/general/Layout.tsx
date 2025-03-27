import { Link, Outlet } from "react-router";
import { Button } from "../ui/button";
import useEventListeners from "@/hooks/useEventListeners";

export default function Layout() {
   useEventListeners();

   return (
      <div>
         <nav className="">
            <Button asChild variant="link">
               <Link className="" to="/home">
                  Home
               </Link>
            </Button>
            <Button asChild variant="link">
               <Link className="" to="/">
                  Sign In
               </Link>
            </Button>
         </nav>
         <Outlet />
      </div>
   );
}

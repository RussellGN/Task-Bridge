import { Link, Outlet } from "react-router";
import { Button } from "../ui/button";

export default function Layout() {
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

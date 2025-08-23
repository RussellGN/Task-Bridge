import BackBtn from "@/components/general/BackBtn";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link, useLocation } from "react-router";

export default function NotFound() {
   const { pathname } = useLocation();

   return (
      <div className="pt-30">
         <h1 className="text-center text-xl font-bold">Something Went Wrong...</h1>

         <p className="text-muted-foreground my-4 text-center">
            Not Found - This part of the app does not exist (yet).
            <br />
            {import.meta.env.DEV && <span className="text-red-500"> {pathname}</span>}
         </p>

         <div className="flex items-center justify-center gap-3">
            <Button title="go back" asChild size="icon" variant="outline">
               <BackBtn />
            </Button>
            <Button title="home-screen" asChild variant="outline">
               <Link to="/projects">
                  Home <Home />
               </Link>
            </Button>
         </div>
      </div>
   );
}

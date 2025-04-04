import { Button } from "@/components/ui/button";
import { CircleArrowLeft, Home } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
   return (
      <div className="pt-30">
         <h1 className="text-center text-xl font-bold">Something Went Wrong...</h1>

         <p className="text-muted-foreground my-4 text-center">
            Not Found - This part of the app does not exist (yet).
         </p>

         <div className="flex items-center justify-center gap-3">
            <Button title="go back" asChild size="icon" variant="outline">
               <Link to="..">
                  <CircleArrowLeft />
               </Link>
            </Button>
            <Button title="home-screen" asChild variant="outline">
               <Link to="/home">
                  Home <Home />
               </Link>
            </Button>
         </div>
      </div>
   );
}

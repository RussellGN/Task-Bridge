import { Button } from "@/components/ui/button";
import { CircleArrowLeft, Home } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
   return (
      <div className="pt-30">
         <h1 className="text-xl font-bold text-center">Something Went Wrong...</h1>

         <p className="text-center text-muted-foreground my-4">
            Not Found - This part of the app does not exist (yet).
         </p>

         <div className="flex justify-center gap-3 items-center">
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

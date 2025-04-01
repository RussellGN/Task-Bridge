import { Button } from "../ui/button";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useDevKit from "@/hooks/component-hooks/useDevKit";

export default function DevKit() {
   const { isExpanded, loading, setIsExpanded } = useDevKit();

   if (import.meta.env.PROD) return null; // Hide in production

   return (
      <div className={`fixed bottom-4 left-4 transition-opacity ${loading ? "pointer-events-none opacity-70" : ""}`}>
         <div
            className={`transition-all duration-100 mb-4 ${
               isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            } bg-foreground/10 shadow-lg rounded-lg p-4 border-2 border-gray-200 ${
               isExpanded ? "pointer-events-auto" : "pointer-events-none"
            }`}
         >
            <h3 className="font-bold mb-4">Dev Kit</h3>

            <div className="mb-3">
               <p className="underline mb-3"> Experimental</p>
               <div className="flex gap-2"></div>
            </div>

            <div>
               <p className="underline mb-3"> Navigation</p>
               <div className="flex gap-2">
                  <Button asChild>
                     <Link to="/home">Home</Link>
                  </Button>
                  <Button asChild>
                     <Link to="/">Sign In</Link>
                  </Button>
               </div>
            </div>
         </div>

         <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-9 h-9 bg-transparent text-white rounded-full shadow-lg hover:bg-gray-700 outline-none ring-1 ring-offset-2 ring-foreground/10"
         >
            {isExpanded ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
         </button>
      </div>
   );
}

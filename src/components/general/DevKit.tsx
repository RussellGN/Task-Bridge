import { Button } from "../ui/button";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useDevKit from "@/hooks/component-hooks/useDevKit";
import { Input } from "../ui/input";

export default function DevKit() {
   const { isExpanded, loading, experimental, setIsExpanded } = useDevKit();

   if (import.meta.env.PROD) return null; // Hide in production

   return (
      <div className={`fixed bottom-4 left-4 transition-opacity ${loading ? "pointer-events-none opacity-70" : ""}`}>
         <div
            className={`mb-4 transition-all duration-100 ${
               isExpanded ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            } bg-foreground/10 rounded-lg border-2 border-gray-200 p-4 shadow-lg ${
               isExpanded ? "pointer-events-auto" : "pointer-events-none"
            }`}
         >
            <h3 className="mb-4 font-bold">Dev Kit</h3>

            <div className="mb-3">
               <p className="mb-3 underline"> Experimental</p>
               <div className="flex gap-2">
                  <Button disabled={loading} onClick={experimental.clearStore}>
                     Clear Store
                  </Button>
               </div>
            </div>

            <div>
               <p className="mb-3 underline"> Navigation</p>
               <form onSubmit={experimental.handleInputNavigation} className="mb-3">
                  <Input type="text" placeholder="route..." name="route" />
               </form>
               <div className="flex gap-2">
                  <Button disabled={loading} asChild>
                     <Link to="/home">Home</Link>
                  </Button>
                  <Button disabled={loading} asChild>
                     <Link to="/">Sign In</Link>
                  </Button>
               </div>
            </div>
         </div>

         <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ring-foreground/10 flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-white shadow-lg ring-1 ring-offset-2 outline-none hover:bg-gray-700"
         >
            {isExpanded ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
         </button>
      </div>
   );
}

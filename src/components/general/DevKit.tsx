import { Button } from "../ui/button";
import { Link } from "react-router";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import useDevKit from "@/hooks/component-hooks/useDevKit";
import { Input } from "../ui/input";

export default function DevKit() {
   const { isExpanded, loading, experimental, setIsExpanded } = useDevKit();

   if (import.meta.env.PROD) return null; // Hide in production

   return (
      <div className={`fixed bottom-4 left-4 transition-opacity ${loading ? "pointer-events-none opacity-70" : ""}`}>
         <div className={` ${isExpanded ? "block" : "hidden"} rounded-lg border-2 border-white bg-black p-4 shadow-lg`}>
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

         <Button
            className="mt-3 size-12 rounded-full border-2 border-white bg-black text-white shadow-2xl hover:bg-black"
            onClick={() => setIsExpanded(!isExpanded)}
         >
            {isExpanded ? <ChevronsLeft className="stroke-3" /> : <ChevronsRight className="stroke-3" />}
         </Button>
      </div>
   );
}

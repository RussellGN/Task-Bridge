import JsonView from "@uiw/react-json-view";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { ChevronsLeft, ChevronsRight, RotateCcw, X } from "lucide-react";
import useDevKit from "@/hooks/component-hooks/useDevKit";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

export default function DevKit() {
   const { store, showStore, jsonViewStyle, isExpanded, loading, experimental, setIsExpanded } = useDevKit();

   if (import.meta.env.PROD) return null; // Hide in production

   return (
      <div className={`fixed bottom-4 left-4 transition-opacity ${loading ? "pointer-events-none opacity-70" : ""}`}>
         <div
            className={cn(
               "bg-background fixed top-0 left-0 h-full w-full flex-1 flex-col gap-3 p-3",
               showStore ? "flex" : "hidden",
            )}
         >
            <h2 className="flex items-center justify-between gap-3">
               Store Debug
               <Button size="icon" className="ml-auto" onClick={experimental.fetchStoreData}>
                  <RotateCcw />
               </Button>
               <Button size="icon" variant="destructive" onClick={experimental.closeStore}>
                  <X />
               </Button>
            </h2>
            <JsonView collapsed value={store ? JSON.parse(store) : {}} keyName="root" style={jsonViewStyle} />
         </div>

         <div className={` ${isExpanded ? "block" : "hidden"} rounded-lg border-2 border-white bg-black p-4 shadow-lg`}>
            <h3 className="mb-4 font-bold">Dev Kit</h3>

            <div className="mb-3">
               <p className="mb-3 underline"> Experimental</p>
               <div className="flex gap-2">
                  <Button disabled={loading} onClick={experimental.clearStore}>
                     Clear Store
                  </Button>
                  <Button disabled={loading} onClick={experimental.openStore}>
                     Show Store
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

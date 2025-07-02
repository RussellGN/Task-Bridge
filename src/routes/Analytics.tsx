import BackBtn from "@/components/general/BackBtn";
import Spinner from "@/components/general/Spinner";
import useAnalytics from "@/hooks/component-hooks/useAnalytics";
import { ChartBar } from "lucide-react";

export default function Analytics() {
   const { project, isLoading } = useAnalytics();

   return (
      <div className="flex h-full flex-col gap-4">
         <div className="mb-4 flex w-full items-center justify-between gap-2">
            <BackBtn />

            <div className="flex items-center gap-2">
               Team Analysis <ChartBar className="mt-0.5" /> {project?.name}
            </div>

            <div className="lucide"></div>
         </div>

         <div className="border-input grow rounded-lg border p-5">
            {isLoading ? (
               <div className="pt-30 text-center">
                  <Spinner size="lg" />
                  <div className="text-foreground/50 mt-2 text-sm">Analyzing team perfomance...</div>
               </div>
            ) : (
               <div></div>
            )}
         </div>
      </div>
   );
}

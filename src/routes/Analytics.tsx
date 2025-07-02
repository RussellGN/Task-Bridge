import BackBtn from "@/components/general/BackBtn";
import Spinner from "@/components/general/Spinner";
import StatCard from "@/components/screens/analysis/StatCard";
import useAnalytics from "@/hooks/component-hooks/useAnalytics";
import { ChartColumn } from "lucide-react";

export default function Analytics() {
   const { project, overallStats, isLoading, taskCompletionStats } = useAnalytics();

   return (
      <div className="flex h-full flex-col gap-4">
         <div className="mb-4 flex w-full items-center justify-between gap-2">
            <BackBtn />

            <div className="flex items-center gap-2">
               Project Analysis <ChartColumn className="mt-0.5" /> {project?.name}
            </div>

            <div className="lucide"></div>
         </div>

         <div className="w-full p-5">
            {isLoading ? (
               <div className="pt-30 text-center">
                  <Spinner size="lg" />
                  <div className="text-foreground/50 mt-2 text-sm">Analyzing...</div>
               </div>
            ) : (
               <div>
                  <div className="mb-20">
                     <h2 className="mb-3 font-semibold capitalize"> Overall</h2>

                     <div className="text-foreground/80 grid grid-cols-6 gap-5">
                        {overallStats.map((overallStat, index) => (
                           <div key={index} className="bg-foreground/5 rounded-lg p-5">
                              <div className="mb-2 text-2xl">{overallStat.value}</div>
                              <div className="font-semibold capitalize">{overallStat.label}</div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h2 className="mb-3 font-semibold capitalize">Task Completion Rates</h2>
                     <div className="text-foreground/80 grid grid-cols-4 gap-5">
                        {taskCompletionStats.map((stat, index) => (
                           <StatCard key={index} stat={stat} />
                        ))}
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

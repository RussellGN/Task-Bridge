import { Input } from "@/components/ui/input";
import SettingSkeleton from "./SettingSkeleton";
import { PROJECT_DASHBOARD_SYNC_INTERVAL_MILLI_SECONDS } from "@/lib/constants";

export default function SyncSettings() {
   return (
      <div>
         <SettingSkeleton
            title="Project Sync Interval"
            description="The time interval at which local projects auto-sync with GitHub. This will determine how often your local projects are updated with activity from GitHub."
         >
            <div className="flex flex-col items-center gap-2 lg:flex-row">
               <label htmlFor="name" className="text-nowrap">
                  Interval (in minutes)
               </label>
               <Input
                  className="w-fit"
                  defaultValue={PROJECT_DASHBOARD_SYNC_INTERVAL_MILLI_SECONDS / (60 * 1000)}
                  type="number"
                  name="interval"
                  id="interval"
                  max={24 * 60}
                  min={1}
                  required
               />
            </div>
         </SettingSkeleton>
      </div>
   );
}

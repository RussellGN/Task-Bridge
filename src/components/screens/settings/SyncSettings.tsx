import { Input } from "@/components/ui/input";
import SettingSkeleton from "./SettingSkeleton";
import { Settings } from "@/types/interfaces";

export default function SyncSettings({ settings }: { settings?: Settings }) {
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
                  defaultValue={settings?.project_sync_interval || 0}
                  type="number"
                  name="project_sync_interval"
                  id="project_sync_interval"
                  max={24 * 60}
                  min={1}
                  required
               />
            </div>
         </SettingSkeleton>
      </div>
   );
}

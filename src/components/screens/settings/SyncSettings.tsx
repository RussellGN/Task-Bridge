import { Input } from "@/components/ui/input";
import SettingSkeleton from "./SettingSkeleton";
import { DEFAULT_PROJECT_SYNC_INTERVAL_MINS } from "@/lib/constants";
import { SettingsTabElementProps } from "@/types/types";

export default function SyncSettings({ appPreferences, project }: SettingsTabElementProps) {
   const intervalLengthMins =
      project?.project_sync_interval_mins ||
      appPreferences?.project_sync_interval_mins ||
      DEFAULT_PROJECT_SYNC_INTERVAL_MINS;

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
                  defaultValue={intervalLengthMins}
                  type="number"
                  name="project_sync_interval_mins"
                  id="project_sync_interval_mins"
                  max={24 * 60}
                  min={5}
                  required
               />
            </div>
         </SettingSkeleton>
      </div>
   );
}

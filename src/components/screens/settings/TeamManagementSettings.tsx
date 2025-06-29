import SettingSkeleton from "./SettingSkeleton";
import { SettingsTabElementProps } from "@/types/types";
import TeamSelector from "@/components/general/TeamSelector";

export default function TeamManagementSettings({ project }: SettingsTabElementProps) {
   const currentTeam = [...(project?.team || []), ...(project?.pending_invites || [])];

   return (
      <div>
         <SettingSkeleton title="Team Management" description="Add/Remove developers working on this project.">
            <TeamSelector defaultTeam={currentTeam} />
         </SettingSkeleton>
      </div>
   );
}

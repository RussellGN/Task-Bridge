import SettingSkeleton from "./SettingSkeleton";
import { SettingsTabElementProps } from "@/types/types";
import TeamSelector from "@/components/general/TeamSelector";
import { PossiblyPendingAuthor } from "@/types/interfaces";

export default function TeamManagementSettings({ project }: SettingsTabElementProps) {
   const currentTeam = [
      ...(project?.team || []),
      ...(project?.pending_invites || []).map((invitee) => ({ ...invitee, pending: true }) as PossiblyPendingAuthor),
   ];

   return (
      <div>
         <SettingSkeleton
            title="Team Management"
            description="Add/Remove developers working on this project (having access to it on GitHub). Developers who have not yet accepted your collaboration request have a grey ring around their avatar, whilst those who've accepted will have a green ringed avatar"
         >
            <TeamSelector defaultTeam={currentTeam} />
         </SettingSkeleton>
      </div>
   );
}

import { cn } from "@/lib/utils";
import { Stat } from "@/types/interfaces";
import { UserAvatar } from "@/components/general/UserAvatar";

export default function StatCard({ stat }: { stat: Stat }) {
   return (
      <div>
         <div className="gap2 bg-card flex items-center justify-between rounded-lg p-4">
            <div>
               {stat.teamMember && (
                  <div className="flex items-center gap-2">
                     <UserAvatar user={stat.teamMember} />
                     <div>{stat.teamMember.login}</div>
                  </div>
               )}
            </div>

            <div className={cn("text-2xl font-semibold", `text-${stat.color}`)}>{stat.value}</div>
         </div>
      </div>
   );
}

import { UserAvatar } from "@/components/general/UserAvatar";
import { Author } from "@/types/interfaces";
import { Link } from "react-router";

type TeamAvatarsPropTypes = {
   team: (Author & {
      pending?: boolean;
   })[];
   maxTeamSizeOnDisplay?: number;
};

export default function TeamAvatars({ team, maxTeamSizeOnDisplay = 3 }: TeamAvatarsPropTypes) {
   return (
      <div className="_avatar-items flex items-center">
         {team.slice(0, maxTeamSizeOnDisplay).map((member) => (
            <Link
               title={member.pending ? `Pending - ${member.login}` : member.login}
               key={member.id}
               to={member.html_url}
               target="_blank"
               className="_avatar-item relative inline-block transition-all"
            >
               <UserAvatar
                  user={member}
                  className={`_avatar-item-sizeable border-3 shadow-lg ${member.pending ? "border-[grey]" : "border-PRIMARY"}`}
               />
            </Link>
         ))}

         {team.length > maxTeamSizeOnDisplay && (
            <div className="inline-block p-1 font-bold">+{team.length - maxTeamSizeOnDisplay}</div>
         )}
      </div>
   );
}

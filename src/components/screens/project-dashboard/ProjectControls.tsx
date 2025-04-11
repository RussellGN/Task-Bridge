import { UserAvatar } from "@/components/general/UserAvatar";
import { Project } from "@/types/interfaces";
import { Link } from "react-router";

export default function ProjectControls({ project }: { project: Project | undefined }) {
   return (
      <div className="flex items-center gap-3">
         <div className="relative">
            {project?.team.map((member, index) => (
               <Link key={member.id} to={member.url} target="_blank" className={`absolute right-${index * 10}`}>
                  <UserAvatar user={member} />
               </Link>
            ))}
         </div>
      </div>
   );
}

import { Project } from "@/types/interfaces";
import { FolderOpen } from "lucide-react";
import { Link } from "react-router";

export default function ProjectCard({ project }: { project: Project }) {
   const shortDate = new Date(project.repo.created_at).toLocaleDateString("en-GB", {
      year: "2-digit",
      month: "short",
      day: "2-digit",
   });
   return (
      <Link to={`/project-dashboard/${project.id}`} className={`w-[30%] p-1 text-center sm:w-[20%] md:w-[16.66%]`}>
         <div className="hover:border-foreground/20 rounded-md border border-transparent p-3 transition-all">
            <div className="mb-2 flex justify-center">
               <span className="rounded-full bg-white/10 p-4">
                  <FolderOpen size={30} />
               </span>
            </div>
            <p className="line-clamp-1 font-semibold">{project.name}</p>
            <p className="text-foreground/50 line-clamp-1 text-xs">{shortDate}</p>
         </div>
      </Link>
   );
}

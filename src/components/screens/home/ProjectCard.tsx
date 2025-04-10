import { Project } from "@/types/interfaces";
import { FolderOpen } from "lucide-react";
import { Link } from "react-router";

export default function ProjectCard({ project }: { project: Project }) {
   return (
      <Link to={`/project-dashboard/${project.name}`} className={`w-[16.66%] p-1 text-center`}>
         <div className="rounded-md border-2 p-3 hover:bg-white/10">
            <div className="mb-2 flex justify-center">
               <FolderOpen size={30} />
            </div>
            <p className="line-clamp-1 font-semibold">{project.name}</p>
         </div>
      </Link>
   );
}

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
      <div className="inline-block w-full p-1 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5">
         <Link
            to={`/project-dashboard/${project.id}`}
            className="hover:border-foreground/20 flex flex-col gap-1 rounded-sm border p-1.5 transition-all"
         >
            <p className="line-clamp-1 text-sm font-semibold">
               <FolderOpen className="mr-1 inline-block" />
               {project.name}
            </p>
            <p className="text-foreground/50 line-clamp-1 text-xs">{shortDate}</p>
         </Link>
      </div>
   );
}

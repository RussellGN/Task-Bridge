import { Project } from "@/types/interfaces";
import TeamAvatars from "./TeamAvatars";
import useProjectControls from "@/hooks/component-hooks/useProjectControls";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Settings } from "lucide-react";

export default function ProjectControls({ project }: { project: Project | undefined }) {
   const { team } = useProjectControls(project);

   return (
      <div className="flex items-center gap-3">
         <Button asChild size="icon" variant="outline">
            <Link to="/settings">
               <Settings />
            </Link>
         </Button>

         <TeamAvatars team={team} />
      </div>
   );
}

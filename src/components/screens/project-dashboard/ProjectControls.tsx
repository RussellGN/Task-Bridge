import { Project } from "@/types/interfaces";
import TeamAvatars from "./TeamAvatars";
import useProjectControls from "@/hooks/component-hooks/useProjectControls";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ChartColumn, Loader2, RotateCcw, Settings } from "lucide-react";

export default function ProjectControls({ project }: { project: Project }) {
   const { team, isSyncing, syncProjectWithGitHub } = useProjectControls(project);

   return (
      <div className="flex items-center gap-3">
         <Button disabled={isSyncing} variant="outline" onClick={syncProjectWithGitHub}>
            {isSyncing ? (
               <>
                  Syncing with GitHub...
                  <Loader2 className="animate-spin" />
               </>
            ) : (
               <>
                  Sync with GitHub
                  <RotateCcw />
               </>
            )}
         </Button>

         <Button asChild variant="outline">
            <Link to={`/analytics/${project.id}`}>
               Project Analysis
               <ChartColumn />
            </Link>
         </Button>

         <Button asChild size="icon" variant="outline">
            <Link to={`/settings/${project.id}`}>
               <Settings />
            </Link>
         </Button>

         <TeamAvatars team={team} />
      </div>
   );
}

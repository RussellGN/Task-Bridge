import { Author, Project } from "@/types/interfaces";
import useSyncProjectWithGitHub from "../backend-api-hooks/useSyncProjectWithGitHub";

export default function useProjectControls(project: Project) {
   const team: (Author & { pending?: boolean })[] = [
      ...(project?.team || []),
      ...(project?.pendingInvites.map((t) => ({ ...t, pending: true })) || []),
   ];

   const { isSyncing, syncProjectWithGitHub } = useSyncProjectWithGitHub(project);

   return { team, isSyncing, syncProjectWithGitHub };
}

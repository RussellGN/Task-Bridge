import { Author, Project } from "@/types/interfaces";

export default function useProjectControls(project: Project | undefined) {
   const team: (Author & { pending?: boolean })[] = [
      ...(project?.team || []),
      ...(project?.pendingInvites.map((t) => ({ ...t, pending: true })) || []),
   ];

   return { team };
}

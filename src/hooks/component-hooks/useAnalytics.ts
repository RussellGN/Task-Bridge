import useGetProject from "../backend-api-hooks/internet-independant/useGetProject";
import { useParams } from "react-router";
import { OverallStat, Stat } from "@/types/interfaces";
import { getTimeElapsedSinceVerbose } from "@/lib/utils";

export default function useAnalytics() {
   const { projectId } = useParams();
   const { project, isLoading } = useGetProject(projectId);

   const creationDtae = new Date(project?.repo.created_at || project?.creation_timestamp || new Date());
   const overallStats: OverallStat[] = [
      {
         label: "Project Duration",
         value: getTimeElapsedSinceVerbose(creationDtae),
      },
      {
         label: "Tasks assigned",
         value: project?.tasks?.length || 0,
      },
      {
         label: "Tasks Drafted",
         value: project?.draft_tasks?.length || 0,
      },
      {
         label: "Tasks completed",
         value: project?.tasks?.filter((task) => task.inner_issue.state === "closed").length || 0,
      },
      {
         label: "Pending invites",
         value: project?.pending_invites.length || 0,
      },
   ];

   const taskCompletionStats: Stat[] = project
      ? project.team.map((member) => {
           const completedTasks = project.tasks?.filter(
              (task) =>
                 task.inner_issue.assignees.find((assignee) => assignee.login === member.login) &&
                 task.inner_issue.state === "closed",
           ).length;
           const totalTasks = project.tasks?.filter((task) =>
              task.inner_issue.assignees.find((assignee) => assignee.login === member.login),
           ).length;

           return {
              label: "Tasks completed",
              color: (completedTasks || 0) / (totalTasks || 1) >= 0.5 ? "PRIMARY" : "DANGER",
              value: totalTasks ? `${(((completedTasks || 0) / totalTasks) * 100).toFixed(2)}%` : "0%",
              teamMember: member,
           };
        })
      : [];

   return {
      project,
      isLoading,
      overallStats,
      taskCompletionStats,
   };
}

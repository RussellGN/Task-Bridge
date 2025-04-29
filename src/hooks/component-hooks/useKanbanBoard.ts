import { Project, Task } from "@/types/interfaces";
import { CheckCircleIcon, Loader, Search, Timer } from "lucide-react";

export default function useKanbanBoard(project: Project) {
   const tasks = project.tasks?.reduce(
      (acc, task) => {
         if (task.innerIssue.closedBy) acc.done.push(task);
         else if (task.innerIssue.pullRequest) acc.underReview.push(task);
         else if (task.innerIssue.assignee || task.innerIssue.assignees.length !== 0) acc.inProgress.push(task);
         else acc.backlog.push(task);
         return acc;
      },
      {
         backlog: [] as Task[],
         inProgress: [] as Task[],
         underReview: [] as Task[],
         done: [] as Task[],
      },
   ) || {
      backlog: [],
      inProgress: [],
      underReview: [],
      done: [],
   };

   const columns = [
      {
         title: "Backlog",
         Icon: Timer,
         tasks: tasks.backlog,
         draftTasks: project.draftTasks || [],
         newTaskForm: true,
      },
      {
         title: "In Progress",
         Icon: Loader,
         tasks: tasks.inProgress,
         draftTasks: [],
         newTaskForm: false,
      },
      {
         title: "Under Review",
         Icon: Search,
         tasks: tasks.underReview,
         draftTasks: [],
         newTaskForm: false,
      },
      {
         title: "Done",
         Icon: CheckCircleIcon,
         tasks: tasks.done,
         draftTasks: [],
         newTaskForm: false,
      },
   ];

   return {
      columns,
   };
}

import { Project, Task } from "@/types/interfaces";
import { useState } from "react";
import { useSearchParams } from "react-router";
import useAssignTaskNow from "../backend-api-hooks/internet-dependant/useAssignTaskNow";
import { alertInfo } from "@/lib/utils";
import useDeleteTask from "../backend-api-hooks/internet-dependant/useDeleteTask";
import useSyncTaskActivity from "../backend-api-hooks/internet-dependant/useSyncTaskActivity";

export default function useKanbanTaskCard(task: Task, project: Project) {
   const [open, setOpen] = useState(false);
   const [alreadySynced, setAlreadySynced] = useState(false);
   const [, setSearchParams] = useSearchParams();
   const { assignTaskNow, isPending: assignNowPending } = useAssignTaskNow(project);
   const { deleteTaskWithId, isPending: deletePending } = useDeleteTask(project);
   const { isPending: isActivitySyncing, syncTaskActivity } = useSyncTaskActivity(project);

   function editTask() {
      console.log("Editing task", task.inner_issue.id);
      setSearchParams((prev) => {
         prev.set("edit_task", task.inner_issue.id.toString());
         return prev;
      });
   }

   function toggleOpen() {
      if (!alreadySynced) syncTaskActivity(task.inner_issue.id.toString()).then(() => setAlreadySynced(true));
      setOpen((prev) => !prev);
   }

   function assignNow() {
      alertInfo("Assigning task to " + task.inner_issue.assignee!.login + "...");
      assignTaskNow(task.inner_issue.id);
   }

   function deleteTask() {
      alertInfo("Deleting task...", task.inner_issue.title);
      deleteTaskWithId(task.inner_issue.id);
   }

   return {
      open,
      isPending: assignNowPending || deletePending,
      isActivitySyncing,
      editTask,
      assignNow,
      deleteTask,
      toggleOpen,
   };
}

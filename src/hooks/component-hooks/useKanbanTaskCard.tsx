import { Project, Task } from "@/types/interfaces";
import { useState } from "react";
import { useSearchParams } from "react-router";
import useAssignTaskNow from "../backend-api-hooks/internet-dependant/useAssignTaskNow";
import { alertInfo } from "@/lib/utils";

export default function useKanbanTaskCard(task: Task, project: Project) {
   const [open, setOpen] = useState(false);
   const toggleOpen = () => setOpen((prev) => !prev);
   const [, setSearchParams] = useSearchParams();
   const { assignTaskNow, isPending: assignNowPending } = useAssignTaskNow(project);

   function editTask() {
      console.log("Editing task", task.inner_issue.id);
      setSearchParams((prev) => {
         prev.set("edit_task", task.inner_issue.id.toString());
         return prev;
      });
   }

   function assignNow() {
      alertInfo("Assigning task to " + task.inner_issue.assignee!.login + "...");
      assignTaskNow(task.inner_issue.id);
   }

   function deleteTask() {
      console.log("Deleting task", task.inner_issue.id);
   }

   return {
      open,
      isPending: assignNowPending,
      editTask,
      assignNow,
      deleteTask,
      toggleOpen,
   };
}

import { Task } from "@/types/interfaces";
import { useState } from "react";
import { useSearchParams } from "react-router";

export default function useKanbanTaskCard(task: Task) {
   const [open, setOpen] = useState(false);
   const toggleOpen = () => setOpen((prev) => !prev);
   const [, setSearchParams] = useSearchParams();

   function editTask() {
      console.log("Editing task", task.innerIssue.id);
      setSearchParams((prev) => {
         prev.set("edit_task", task.innerIssue.id.toString());
         return prev;
      });
   }

   function deleteTask() {
      console.log("Deleting task", task.innerIssue.id);
   }

   return {
      open,
      editTask,
      deleteTask,
      toggleOpen,
   };
}

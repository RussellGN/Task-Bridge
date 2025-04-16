import { Task } from "@/types/interfaces";
import { useState } from "react";

export default function useKanbanTaskCard(task: Task) {
   const [open, setOpen] = useState(false);
   const toggleOpen = () => setOpen((prev) => !prev);

   function setTaskToReady() {
      console.log("Task is now ready", task.id);
   }

   function editTask() {
      console.log("Editing task", task.id);
   }

   function deleteTask() {
      console.log("Deleting task", task.id);
   }

   return {
      open,
      toggleOpen,
      setTaskToReady,
      editTask,
      deleteTask,
   };
}

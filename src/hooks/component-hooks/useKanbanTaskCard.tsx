import { Task } from "@/types/interfaces";
import { useState } from "react";
import { useSearchParams } from "react-router";

export default function useKanbanTaskCard(task: Task) {
   const [open, setOpen] = useState(false);
   const toggleOpen = () => setOpen((prev) => !prev);
   const [, setSearchParams] = useSearchParams();

   function setTaskToReady() {
      console.log("Task is now ready", task.id);
   }

   function editTask() {
      console.log("Editing task", task.id);
      setSearchParams((prev) => {
         prev.set("edit_task", task.id.toString());
         return prev;
      });
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

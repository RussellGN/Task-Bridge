import { sampleTasks } from "@/lib/sample-data";
import { alertInfo, alertSuccess, wait } from "@/lib/utils";
import { Task } from "@/types/interfaces";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router";

export default function useNewTaskForm() {
   const [searchParams, setSearchParams] = useSearchParams();
   const [taskToEdit, setTaskToEdit] = React.useState<Task | undefined>();
   const [open, setOpen] = React.useState(false);
   const [isDraft, setIsDraft] = React.useState(taskToEdit?.isDraft || false);

   useEffect(() => {
      const taskTodEditId = searchParams.get("edit_task");
      const task = sampleTasks.find((task) => task.id.toString() === taskTodEditId);
      if (task) {
         setTaskToEdit(task);
         setOpen(true);
         setIsDraft(!!task.isDraft);
      }
   }, [searchParams]);

   function removeTaskToEdit() {
      setTaskToEdit(undefined);
      setSearchParams((prev) => {
         prev.delete("edit_task");
         return prev;
      });
   }

   function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget));

      if (taskToEdit) {
         console.log("saving updated task", data, isDraft);
         alertInfo("Saving updated task...");
      } else {
         console.log("creating", data, isDraft);
         alertInfo(isDraft ? "Saving draft..." : "Creating task...");
      }

      wait(2).then(() => {
         removeTaskToEdit();
         setOpen(false);
         setIsDraft(false);
         if (taskToEdit) alertSuccess("Task updated!");
         else alertSuccess(isDraft ? "Draft saved!" : "Task created!");
      });
   }

   return {
      open,
      taskToEdit,
      setOpen,
      setIsDraft,
      handleSubmit,
      removeTaskToEdit,
   };
}

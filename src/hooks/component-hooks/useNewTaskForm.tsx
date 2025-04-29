import { alertInfo, alertSuccess, wait } from "@/lib/utils";
import { DraftTask, Task } from "@/types/interfaces";
import React from "react";
import { useSearchParams } from "react-router";

export default function useNewTaskForm(tasks: Task[], drafts: DraftTask[]) {
   const [open, setOpen] = React.useState(false);
   const [isDraft, setIsDraft] = React.useState(false);
   const [searchParams, setSearchParams] = useSearchParams();

   const taskToEditId = searchParams.get("edit_task");
   const draftToEditId = searchParams.get("edit_draft");

   const taskToEdit = tasks.find((task) => task.innerIssue.id.toString() === taskToEditId);
   const draftToEdit = drafts.find((draft) => draft.id.toString() === draftToEditId);

   const isDraftFinal = !!draftToEditId || isDraft;

   function removeItemToEdit() {
      setSearchParams((prev) => {
         prev.delete("edit_task");
         prev.delete("edit_draft");
         return prev;
      });
   }

   function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget));

      if (taskToEdit) alertInfo("Saving updated task...");
      else alertInfo(isDraftFinal ? "Saving draft..." : "Creating task...");

      wait(2).then(() => {
         console.log(data);
         if (taskToEdit) alertSuccess("Task updated!");
         else alertSuccess(isDraftFinal ? "Draft saved!" : "Task created!");
         removeItemToEdit();
         setOpen(false);
      });
   }

   function onOpenChange(open: boolean) {
      if (!open) removeItemToEdit();
      setOpen(open);
   }

   const itemToEdit = {
      id: taskToEdit?.innerIssue.id || draftToEdit?.id,
      title: taskToEdit?.innerIssue.title || draftToEdit?.title,
      body: taskToEdit?.innerIssue.body || draftToEdit?.body || undefined,
      priority: taskToEdit?.priority || draftToEdit?.priority,
      assignee: taskToEdit?.innerIssue.assignee || draftToEdit?.assignee,
   };

   return {
      open: open || !!taskToEdit || !!draftToEdit,
      itemToEdit,
      setIsDraft,
      onOpenChange,
      handleSubmit,
   };
}

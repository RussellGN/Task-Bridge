import React from "react";
import useCreateTask from "../backend-api-hooks/useCreateTask";
import { TaskPriority } from "@/types/types";
import { useSearchParams } from "react-router";
import { NewDraftTaskPayload, NewTaskPayload, Project } from "@/types/interfaces";
import { alertInfo, alertSuccess, wait } from "@/lib/utils";
import useCreateDraftTask from "../backend-api-hooks/useCreateDraftTask";

export default function useNewTaskForm(project: Project) {
   const [open, setOpen] = React.useState(false);
   const [isDraft, setIsDraft] = React.useState(false);
   const [searchParams, setSearchParams] = useSearchParams();
   const { createTask, isPending: creationPending, errorMessage: taskCreationError } = useCreateTask(project.id);
   const { createDraft, isPending: draftPending, errorMessage: draftCreationError } = useCreateDraftTask(project.id);

   const taskToEditId = searchParams.get("edit_task");
   const draftToEditId = searchParams.get("edit_draft");

   const taskToEdit = project.tasks?.find((task) => task.inner_issue.id.toString() === taskToEditId);
   const draftToEdit = project.draft_tasks?.find((draft) => draft.id.toString() === draftToEditId);

   const isDraftFinal = !!draftToEditId || isDraft;

   const itemToEdit = {
      id: taskToEdit?.inner_issue.id || draftToEdit?.id,
      title: taskToEdit?.inner_issue.title || draftToEdit?.title,
      body: taskToEdit?.inner_issue.body || draftToEdit?.body || undefined,
      priority: taskToEdit?.priority || draftToEdit?.priority,
      assignee: taskToEdit?.inner_issue.assignee || draftToEdit?.assignee,
   };

   const isEditing = !!taskToEdit || !!draftToEdit;

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

      if (taskToEdit) {
         alertInfo("Saving updated task...");
         wait(2).then(() => {
            alertSuccess("Task updated!");
            removeItemToEdit();
            setOpen(false);
         });
      } else if (isDraftFinal) {
         alertInfo("Saving draft...");
         const payload: NewDraftTaskPayload = {
            project_id: project.id,
            title: data.title as string,
            body: data.body as string,
            priority: data.priority as TaskPriority,
            assignee_login: data.assignee as string,
         };
         console.log(data, payload);
         createDraft(payload);
      } else {
         const payload: NewTaskPayload = {
            project_id: project.id,
            title: data.title as string,
            body: data.body as string,
            priority: data.priority as TaskPriority,
            assignee_login: data.assignee as string,
         };
         console.log(data, payload);
         alertInfo("Creating task...");
         createTask(payload);
      }
   }

   function onOpenChange(open: boolean) {
      if (!open) removeItemToEdit();
      setOpen(open);
   }

   return {
      isEditing,
      open: open || !!taskToEdit || !!draftToEdit,
      itemToEdit,
      team: project.team,
      pendingTeam: project.pending_invites,
      isPending: creationPending || draftPending,
      errorMessage: taskCreationError || draftCreationError,
      setIsDraft,
      onOpenChange,
      handleSubmit,
   };
}

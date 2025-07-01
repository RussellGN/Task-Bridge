import React from "react";
import useCreateTask from "../backend-api-hooks/internet-dependant/useCreateTask";
import { TaskPriority } from "@/types/types";
import { useSearchParams } from "react-router";
import { NewDraftTaskPayload, NewTaskPayload, Project } from "@/types/interfaces";
import useCreateDraftTask from "../backend-api-hooks/internet-independant/useCreateDraftTask";
import { DEFAULT_NONE_SELECT_VALUE } from "@/lib/constants";
import useCreateBacklogTask from "../backend-api-hooks/internet-dependant/useCreateBacklogTask";
import useEditTask from "../backend-api-hooks/internet-dependant/useEditTask";
import useEditDraftTask from "../backend-api-hooks/internet-dependant/useEditDraftTask";

export default function useNewTaskForm(project: Project) {
   const [open, setOpen] = React.useState(false);
   const [isDraft, setIsDraft] = React.useState(false);
   const [searchParams, setSearchParams] = useSearchParams();
   const [assignee, setAssignee] = React.useState<string | undefined>(undefined);
   const [addToBacklog, setAddToBacklog] = React.useState(false);
   const [submitBtnClicked, setSubmitBtnClicked] = React.useState<null | "backlog" | "draft" | "assign">(null);
   const { createTask, isPending: creationPending, errorMessage: taskCreationError } = useCreateTask(project.id);
   const { createDraft, isPending: draftPending, errorMessage: draftCreationError } = useCreateDraftTask(project.id);
   const {
      createBacklogTask,
      isPending: backlogAdditionPending,
      errorMessage: backlogAdditionError,
   } = useCreateBacklogTask(project.id);
   const { editTask, isPending: editPending } = useEditTask(project.id);
   const { editDraftTask, isPending: editDraftPending } = useEditDraftTask(project.id);

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

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.currentTarget));
      const payload = {
         project_id: project.id,
         title: data.title as string,
         body: data.body as string,
         priority: data.priority as TaskPriority,
         assignee_login: data.assignee as string | undefined,
      };
      payload.assignee_login =
         payload.assignee_login === DEFAULT_NONE_SELECT_VALUE ? undefined : payload.assignee_login;
      console.log(data, payload);

      const drafting = isDraftFinal || payload?.assignee_login === DEFAULT_NONE_SELECT_VALUE;

      if (isEditing && taskToEdit) {
         await editTask(payload as NewTaskPayload, taskToEdit.inner_issue.id.toString());
      } else if (isEditing && draftToEdit) {
         editDraftTask(payload as NewDraftTaskPayload, draftToEdit.id.toString());
      } else if (drafting) await createDraft(payload as NewDraftTaskPayload);
      else if (addToBacklog) await createBacklogTask(payload as NewTaskPayload);
      else await createTask(payload as NewTaskPayload);

      cleanupAndcloseModal();
   }

   function onOpenChange(open: boolean) {
      if (!open) cleanupAndcloseModal();
      setOpen(open);
   }

   function cleanupAndcloseModal() {
      setSearchParams((prev) => {
         prev.delete("edit_task");
         prev.delete("edit_draft");
         return prev;
      });
      setOpen(false);
      setAssignee(undefined);
      setAddToBacklog(false);
      setIsDraft(false);
   }

   return {
      assignee,
      isEditing,
      itemToEdit,
      submitBtnClicked,
      team: project.team,
      pendingTeam: project.pending_invites,
      isPending: creationPending || draftPending || backlogAdditionPending || editPending || editDraftPending,
      open: open || !!taskToEdit || !!draftToEdit,
      errorMessage: taskCreationError || draftCreationError || backlogAdditionError,
      setIsDraft,
      setAssignee,
      onOpenChange,
      handleSubmit,
      setAddToBacklog,
      setSubmitBtnClicked,
   };
}

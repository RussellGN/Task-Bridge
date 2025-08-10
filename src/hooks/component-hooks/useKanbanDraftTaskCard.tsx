import { DraftTask, Project } from "@/types/interfaces";
import { useState } from "react";
import { useSearchParams } from "react-router";
import useDeleteDraftTask from "../backend-api-hooks/internet-dependant/useDeleteDraftTask";
import { wait } from "@/lib/utils";
import { alertInfo } from "@/lib/logging";
import useAssignDraftTaskNow from "../backend-api-hooks/internet-dependant/useAssignDraftTaskNow";

export default function useKanbanDraftTaskCard(draft: DraftTask, project: Project) {
   const [open, setOpen] = useState(false);
   const toggleOpen = () => setOpen((prev) => !prev);
   const [, setSearchParams] = useSearchParams();
   const { isPending: deletePending, deleteDraftTaskWithId } = useDeleteDraftTask(project);
   const { isPending: draftAssignPending, assignDraftTaskNow } = useAssignDraftTaskNow(project);

   function assignNow() {
      alertInfo("Assigning drafted task to " + draft.assignee!.login + "...");
      assignDraftTaskNow(draft.id);
   }

   function editDraft() {
      setSearchParams((prev) => {
         prev.set("edit_draft", draft.id.toString());
         return prev;
      });
   }

   function deleteDraft() {
      alertInfo("Deleting draft task...", draft.title);
      wait(1).then(() => deleteDraftTaskWithId(draft.id));
   }

   return {
      open,
      isPending: deletePending || draftAssignPending,
      assignNow,
      editDraft,
      toggleOpen,
      deleteDraft,
   };
}

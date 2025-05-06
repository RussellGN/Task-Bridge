import { DraftTask } from "@/types/interfaces";
import { useState } from "react";
import { useSearchParams } from "react-router";

export default function useKanbanDraftTaskCard(draft: DraftTask) {
   const [open, setOpen] = useState(false);
   const toggleOpen = () => setOpen((prev) => !prev);
   const [, setSearchParams] = useSearchParams();

   function setDraftToReady() {
      console.log("Draft is now ready", draft.id);
   }

   function editDraft() {
      setSearchParams((prev) => {
         prev.set("edit_draft", draft.id.toString());
         return prev;
      });
   }

   function deleteDraft() {
      console.log("Deleting draft", draft.id);
   }

   return {
      open,
      editDraft,
      toggleOpen,
      deleteDraft,
      setDraftToReady,
   };
}

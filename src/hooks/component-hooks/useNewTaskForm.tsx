import { alertInfo, alertSuccess, wait } from "@/lib/utils";
import React from "react";

export default function useNewTaskForm() {
   const [open, setOpen] = React.useState(false);
   const [isDraft, setIsDraft] = React.useState(false);

   function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget));
      console.log("creating", data, isDraft);
      alertInfo(isDraft ? "Saving draft..." : "Creating task...");
      wait(3).then(() => {
         setOpen(false);
         setIsDraft(false);
         alertSuccess(isDraft ? "Draft saved!" : "Task created!");
      });
   }

   return {
      open,
      setOpen,
      setIsDraft,
      handleSubmit,
   };
}

import useCreateProject from "../backend-api-hooks/internet-dependant/useCreateProject";
import { NewProjectPayload } from "@/types/interfaces";
import { FormEvent } from "react";
import { dbg } from "@/lib/utils";

export default function useNewProjectForm() {
   const { errorMessage: projectCreationErr, isPending, createProject } = useCreateProject();

   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const repovisibility = data["repo_visibility"] as string;
      const projectPayload = data as unknown as NewProjectPayload;
      projectPayload.repo_is_private = repovisibility === "private";
      dbg("[handleSubmit]", projectPayload);

      createProject(projectPayload);
   };

   return {
      isPending,
      projectCreationErr,
      handleSubmit,
   };
}

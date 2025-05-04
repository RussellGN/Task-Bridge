import { FormEvent, useState } from "react";
import useCreateProject from "../backend-api-hooks/internet-dependant/useCreateProject";
import { NewProjectPayload } from "@/types/interfaces";
import { dbg } from "@/lib/utils";

export default function useNewProjectTab() {
   const [projectName, setProjectName] = useState<string>("");
   const { errorMessage: projectCreationErr, isPending, createProject } = useCreateProject();

   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const projectPayload: NewProjectPayload = {
         name: data["name"] as string,
         repo_name: data["repoName"] as string,
         team: data["team"] as string,
      };
      dbg("[handleSubmit]", projectPayload);

      createProject(projectPayload);
   };

   return {
      isPending,
      projectName,
      projectCreationErr,
      handleSubmit,
      setProjectName,
   };
}

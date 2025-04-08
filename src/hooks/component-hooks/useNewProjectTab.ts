import { FormEvent, useState } from "react";
import useCreateProject from "../backend-api-hooks/useCreateProject";
import { NewProjectInterface } from "@/lib/interfaces";
import { dbg } from "@/lib/utils";

export default function useNewProjectTab() {
   const [projectName, setProjectName] = useState<string>("");
   const { error: projectCreationErr, isPending, createProject } = useCreateProject();

   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      const projectData: NewProjectInterface = {
         name: data["name"] as string,
         repoName: data["repoName"] as string,
         shouldCreateRepo: data["shouldCreateRepo"] === "true",
         team: data["repoName"] as string,
      };
      dbg("[handleSubmit]", projectData);

      createProject(projectData);
   };

   return {
      isPending,
      projectName,
      projectCreationErr,
      handleSubmit,
      setProjectName,
   };
}

import { FormEvent, useState } from "react";

export default function useNewProjectTab() {
   const [projectName, setProjectName] = useState<string>("");

   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      console.log(data);
   };

   return {
      projectName,
      handleSubmit,
      setProjectName,
   };
}

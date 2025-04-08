import InfoTooltip from "@/components/general/InfoTooltip";
import Spinner from "@/components/general/Spinner";
import TeamSelector from "@/components/general/TeamSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useNewProjectTab from "@/hooks/component-hooks/useNewProjectTab";
import { AlertTriangle } from "lucide-react";

export default function NewProjectTab() {
   const { isPending, projectName, projectCreationErr, handleSubmit, setProjectName } = useNewProjectTab();

   return (
      <form onSubmit={handleSubmit} className="flex h-full flex-1 flex-col gap-4 p-5">
         <h1 className="mb-3 text-lg font-bold">Start New Project</h1>

         {projectCreationErr && (
            <div className="mb-3">
               <p className="text-DANGER flex items-center gap-1">
                  <AlertTriangle className="-mb-0.5" size={17} />
                  {projectCreationErr.message || JSON.stringify(projectCreationErr)}
               </p>
            </div>
         )}

         <div className="mb-5 items-center gap-10 lg:flex">
            <label htmlFor="name" className="mb-2 block min-w-1/5 text-nowrap">
               Project name:
            </label>
            <Input
               type="text"
               name="name"
               id="name"
               maxLength={40}
               minLength={2}
               placeholder="Your new project's name..."
               required
               value={projectName}
               onChange={(e) => setProjectName(e.target.value)}
               disabled={isPending}
            />
         </div>

         <div className="mb-5 items-center gap-10 lg:flex">
            <label htmlFor="shouldCreateRepo" className="mb-2 flex min-w-1/5 items-center gap-3 text-nowrap">
               Create GitHub Repository:
               <InfoTooltip
                  align="start"
                  className="-mb-1"
                  content="Create a new GitHub repository for this project?"
               />
            </label>
            <Input
               type="checkbox"
               name="shouldCreateRepo"
               id="shouldCreateRepo"
               value="true"
               className="size-5"
               checked
               required
               readOnly
               disabled={isPending}
            />
         </div>

         <div className="mb-5 items-center gap-10 lg:flex">
            <label htmlFor="repoName" className="mb-2 flex min-w-1/5 items-center gap-3 text-nowrap">
               GitHub Repo name:
               <InfoTooltip
                  align="start"
                  className="-mb-1"
                  content="Name of the project's Github repository. Derived from project name"
               />
            </label>
            <Input
               type="text"
               name="repoName"
               id="repoName"
               maxLength={40}
               minLength={2}
               required
               placeholder="Derived from project name..."
               value={projectName}
               readOnly
               disabled={isPending}
            />
         </div>

         <div className="mb-5 items-start gap-10 lg:flex">
            <label htmlFor="team" className="mb-2 flex min-w-1/5 items-center gap-3 text-nowrap">
               Team:
               <InfoTooltip
                  align="start"
                  className="-mb-1"
                  content="Designate a team for the project. They will receive invites to the project in Task-Bridge, as well as contributor access to the project repository."
               />
            </label>
            <div className="grow">
               <TeamSelector disabled={isPending} />
            </div>
         </div>

         <div className="mt-10 text-end">
            {isPending ? (
               <div className="flex items-center justify-end gap-2">
                  <Spinner />
                  <p className="text-muted-foreground text-sm">Creating project...</p>
               </div>
            ) : (
               <Button disabled={isPending} variant="PRIMARY" type="submit">
                  Create
               </Button>
            )}
         </div>
      </form>
   );
}

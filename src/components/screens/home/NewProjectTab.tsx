import InfoTooltip from "@/components/general/InfoTooltip";
import TeamSelector from "@/components/general/TeamSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useNewProjectTab from "@/hooks/component-hooks/useNewProjectTab";

export default function NewProjectTab() {
   const { handleSubmit, projectName, setProjectName } = useNewProjectTab();

   return (
      <form onSubmit={handleSubmit} className="flex h-full flex-1 flex-col gap-4 p-5">
         <h1 className="mb-3 text-lg font-bold">Start New Project</h1>

         <div className="mb-4 flex items-center gap-10">
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
            />
         </div>

         <div className="mb-4 flex items-center gap-10">
            <label htmlFor="should_create_repo" className="mb-2 flex min-w-1/5 items-center gap-4 text-nowrap">
               Create GitHub Repository:
               <InfoTooltip
                  align="start"
                  className="-mb-1"
                  content="Create a new GitHub repository for this project?"
               />
            </label>
            <Input
               type="checkbox"
               name="should_create_repo"
               id="should_create_repo"
               value="yes"
               className="size-5"
               checked
               required
               readOnly
            />
         </div>

         <div className="mb-4 flex items-center gap-10">
            <label htmlFor="repo_name" className="mb-2 flex min-w-1/5 items-center gap-4 text-nowrap">
               GitHub Repo name:
               <InfoTooltip
                  align="start"
                  className="-mb-1"
                  content="Name of the project's Github repository. Derived from project name"
               />
            </label>
            <Input
               type="text"
               name="repo_name"
               id="repo_name"
               maxLength={40}
               minLength={2}
               required
               placeholder="Derived from project name..."
               value={projectName}
               readOnly
            />
         </div>

         <div className="mb-4 flex items-center gap-10">
            <label htmlFor="team" className="mb-2 flex min-w-1/5 items-center gap-4 text-nowrap">
               Team - Access Invitations:
               <InfoTooltip
                  align="start"
                  className="-mb-1"
                  content="Designate a team for the project. They will receive invites to the project in Task-Bridge, as well as contributor access to the project repository."
               />
            </label>
            <div className="grow">
               <TeamSelector />
            </div>
         </div>

         <div className="mt-10 text-end">
            <Button variant="PRIMARY" type="submit">
               Create
            </Button>
         </div>
      </form>
   );
}

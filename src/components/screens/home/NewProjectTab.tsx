import Spinner from "@/components/general/Spinner";
import InfoTooltip from "@/components/general/InfoTooltip";
import TeamSelector from "@/components/general/TeamSelector";
import ErrorDisplay from "@/components/general/ErrorDisplay";
import useNewProjectTab from "@/hooks/component-hooks/useNewProjectTab";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewProjectTab() {
   const { isPending, projectCreationErr, handleSubmit } = useNewProjectTab();

   return (
      <form onSubmit={handleSubmit} className="flex h-full flex-1 flex-col gap-4 p-5">
         <h1 className="mb-3 text-lg font-bold">Start New Project</h1>

         <ErrorDisplay containerClassName="mb-3" error={projectCreationErr} />

         <div className="mb-5 items-center gap-10 lg:flex">
            <label htmlFor="name" className="mb-2 block min-w-1/5 text-nowrap">
               Project name
            </label>
            <Input type="text" name="name" id="name" maxLength={40} minLength={2} required disabled={isPending} />
         </div>

         <div className="mb-5 items-center gap-10 lg:flex">
            <label htmlFor="repo_name" className="mb-2 flex min-w-1/5 items-center gap-3 text-nowrap">
               GitHub repo name
               <InfoTooltip align="start" className="-mb-1" content="Name of the project's Github repository." />
            </label>
            <Input
               type="text"
               name="repo_name"
               id="repo_name"
               maxLength={40}
               minLength={2}
               required
               disabled={isPending}
            />
         </div>

         <div className="mb-5 items-center gap-10 lg:flex">
            <Label htmlFor="repo_visibility" className="mb-2 min-w-1/5 text-nowrap">
               GitHub repo visibility
               <InfoTooltip
                  align="start"
                  className="-mb-1"
                  content="Whether the project's GitHub repository is publicly visible or private."
               />
            </Label>

            <Select required name="repo_visibility" defaultValue="public" disabled={isPending}>
               <SelectTrigger>
                  <SelectValue placeholder="public" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="public">
                     <Globe /> Public
                  </SelectItem>
                  <SelectItem value="private">
                     <Lock /> Private
                  </SelectItem>
               </SelectContent>
            </Select>
         </div>

         <div className="mb-5 items-start gap-10 lg:flex">
            <label htmlFor="team" className="mb-2 flex min-w-1/5 items-center gap-3 text-nowrap">
               Team
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

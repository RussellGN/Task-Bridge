import SettingSkeleton from "./SettingSkeleton";
import { SettingsTabElementProps } from "@/types/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import InfoTooltip from "@/components/general/InfoTooltip";
import { Globe, Lock } from "lucide-react";

export default function NameAndVisibilitySettings({ project }: SettingsTabElementProps) {
   return (
      <div>
         <SettingSkeleton title="Name & Visibility" description="General metadata of the project.">
            <div className="mb-5 items-center gap-10 lg:flex">
               <Label htmlFor="title" className="mb-2 min-w-1/5 text-nowrap">
                  Project Name<span className="text-PRIMARY">*</span>
               </Label>
               <Input type="text" name="name" maxLength={40} minLength={2} required defaultValue={project?.name} />
            </div>

            <div className="mb-5 items-center gap-10 lg:flex">
               <Label htmlFor="title" className="mb-2 min-w-1/5 text-nowrap">
                  Repo Name<span className="text-PRIMARY">*</span>
                  <InfoTooltip align="start" className="-mb-1" content="Name of the project's Github repository." />
               </Label>
               <Input
                  type="text"
                  name="repo_name"
                  maxLength={40}
                  minLength={2}
                  required
                  defaultValue={project?.repo.name}
               />
            </div>

            <div className="mb-5 items-center gap-10 lg:flex">
               <Label htmlFor="priority" className="mb-2 min-w-1/5 text-nowrap">
                  Repo Visibility<span className="text-PRIMARY">*</span>
                  <InfoTooltip
                     align="start"
                     className="-mb-1"
                     content="Whether the project's GitHub repository is publicly visible or private."
                  />
               </Label>

               <Select name="repo_visibility" defaultValue={project?.repo.visibility}>
                  <SelectTrigger>
                     <SelectValue placeholder={project?.repo.visibility} />
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
         </SettingSkeleton>
      </div>
   );
}

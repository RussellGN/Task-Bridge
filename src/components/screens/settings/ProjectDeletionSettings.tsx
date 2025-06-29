import { Button } from "@/components/ui/button";
import SettingSkeleton from "./SettingSkeleton";
import { SettingsTabElementProps } from "@/types/types";
import { Input } from "@/components/ui/input";

export default function ProjectDeletionSettings({ project }: SettingsTabElementProps) {
   console.log("delete options", project?.name);
   return (
      <SettingSkeleton title="Danger Zone" description="Project Deletion options.">
         <div className="mb-10">
            <p className="font-semibold">Delete project locally</p>
            <p className="my-2">
               This will delete the project and all its data from your computer. You can restore it by
               {' "syncing all projects from GitHub"'} in the projects explorer.{" "}
               <b>Note, all draft tasks will be lost and cannot be restored.</b>
            </p>
            <div>
               <Button type="button" variant="destructive">
                  Delete Local Project
               </Button>
            </div>
         </div>

         <div>
            <p className="font-semibold">Delete GitHub repository & local project data</p>
            <p className="my-2">
               This will <b>permanently delete</b> the project and its GitHub repository -{" "}
               <b> along with all of its source code</b>. Only do this if {"you're"} certain you dont need it anymore.{" "}
               <b>This cannot be undone!</b>
            </p>
            <div>
               <Input
                  type="text"
                  name="permanentDeleteProject"
                  required
                  className="border-DANGER"
                  placeholder="Enter 'delete' followed by this project's exact name and click save to delete"
               />
            </div>
         </div>
      </SettingSkeleton>
   );
}

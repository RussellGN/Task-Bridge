import useNewTaskForm from "@/hooks/component-hooks/useNewTaskForm";
import { ArrowRight, Check, NotebookPen, Plus } from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Author, DraftTask, Task } from "@/types/interfaces";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/general/UserAvatar";
import { TASK_PRIORITIES } from "@/lib/constants";

type NewTaskFormProps = {
   team: Author[];
   pendingTeam?: Author[];
   tasks: Task[];
   drafts: DraftTask[];
};

export default function NewTaskForm({ team, drafts, tasks, pendingTeam }: NewTaskFormProps) {
   const { open, setIsDraft, itemToEdit, handleSubmit, onOpenChange } = useNewTaskForm(tasks, drafts);

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogTrigger className="btn btn-PRIMARY">
            New Task <Plus />
         </DialogTrigger>

         <DialogContent>
            <DialogHeader>
               <DialogTitle>{itemToEdit ? "Edit Task" : "New Task"}</DialogTitle>
               <DialogDescription hidden>{itemToEdit ? "Edit existing task" : "Create a new task."}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="py-8">
               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="title" className="mb-2 min-w-1/5 text-nowrap">
                     Title<span className="text-PRIMARY">*</span>
                  </Label>
                  <Input
                     type="text"
                     name="title"
                     maxLength={40}
                     minLength={2}
                     required
                     defaultValue={itemToEdit?.title}
                  />
               </div>

               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="body" className="mb-2 min-w-1/5 text-nowrap">
                     Description
                  </Label>
                  <Textarea name="body" maxLength={300} minLength={2} rows={2} defaultValue={itemToEdit?.body} />
               </div>

               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="priority" className="mb-2 min-w-1/5 text-nowrap">
                     Priority
                  </Label>

                  <Select name="priority" defaultValue={itemToEdit?.priority || "normal"}>
                     <SelectTrigger>
                        <SelectValue placeholder={itemToEdit?.priority || "normal"} />
                     </SelectTrigger>
                     <SelectContent>
                        {TASK_PRIORITIES.map((priority) => (
                           <SelectItem key={priority} value={priority}>
                              {priority}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="assignee" className="mb-2 min-w-1/5 text-nowrap">
                     Assign to
                  </Label>

                  <Select name="assignee" defaultValue={itemToEdit?.assignee?.login}>
                     <SelectTrigger>
                        <SelectValue
                           placeholder={
                              itemToEdit?.assignee ? (
                                 <>
                                    <UserAvatar user={itemToEdit.assignee} className="size-4.5" />
                                    {itemToEdit.assignee.login}
                                 </>
                              ) : (
                                 "Assign to"
                              )
                           }
                        />
                     </SelectTrigger>

                     <SelectContent>
                        {team.map((user) => (
                           <SelectItem key={user.login} value={user.login}>
                              <UserAvatar user={user} className="size-4.5" />
                              {user.login}
                           </SelectItem>
                        ))}
                        {pendingTeam?.map((user) => (
                           <SelectItem key={user.login} value={user.login}>
                              <UserAvatar user={user} className="size-4.5" />
                              {user.login}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               <div className="mt-10 flex justify-end gap-3">
                  {itemToEdit ? (
                     <Button type="submit">
                        Save updates <Check />
                     </Button>
                  ) : (
                     <>
                        <Button type="submit" onClick={() => setIsDraft(true)}>
                           Save as draft <NotebookPen />
                        </Button>

                        <Button variant="PRIMARY" type="submit" onClick={() => setIsDraft(false)}>
                           Create <ArrowRight />
                        </Button>
                     </>
                  )}
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}

import useNewTaskForm from "@/hooks/component-hooks/useNewTaskForm";
import { ArrowRight, NotebookPen, Plus } from "lucide-react";
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
import { Author } from "@/types/interfaces";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/general/UserAvatar";

type NewTaskFormProps = {
   team: Author[];
   pendingTeam?: Author[];
};

export default function NewTaskForm({ team, pendingTeam }: NewTaskFormProps) {
   const { open, setOpen, setIsDraft, handleSubmit } = useNewTaskForm();

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger className="btn btn-PRIMARY">
            New Task <Plus />
         </DialogTrigger>

         <DialogContent>
            <DialogHeader>
               <DialogTitle>New Task</DialogTitle>
               <DialogDescription hidden>Create a new task.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="py-8">
               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="title" className="mb-2 min-w-1/5 text-nowrap">
                     Title<span className="text-PRIMARY">*</span>
                  </Label>
                  <Input type="text" name="title" maxLength={40} minLength={2} required />
               </div>

               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="body" className="mb-2 min-w-1/5 text-nowrap">
                     Description
                  </Label>
                  <Textarea name="body" maxLength={300} minLength={2} rows={2} />
               </div>

               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="priority" className="mb-2 min-w-1/5 text-nowrap">
                     Priority
                  </Label>

                  <Select name="priority" defaultValue="normal">
                     <SelectTrigger>
                        <SelectValue placeholder="Normal" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="assignee" className="mb-2 min-w-1/5 text-nowrap">
                     Assign to
                  </Label>
                  <Select name="assignee">
                     <SelectTrigger>
                        <SelectValue placeholder="Assign to" />
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
                  <Button type="submit" onClick={() => setIsDraft(true)}>
                     Save as draft <NotebookPen />
                  </Button>

                  <Button variant="PRIMARY" type="submit" onClick={() => setIsDraft(false)}>
                     Create <ArrowRight />
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}

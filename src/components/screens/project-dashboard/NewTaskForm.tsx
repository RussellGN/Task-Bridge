import useNewTaskForm from "@/hooks/component-hooks/useNewTaskForm";
import { ArrowRight, Check, NotebookPen, Plus, Timer } from "lucide-react";
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
import { Project } from "@/types/interfaces";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/general/UserAvatar";
import { DEFAULT_NONE_SELECT_VALUE, TASK_PRIORITIES } from "@/lib/constants";
import ErrorDisplay from "@/components/general/ErrorDisplay";
import SpinnerIcon from "@/components/general/SpinnerIcon";
import InfoTooltip from "@/components/general/InfoTooltip";

type NewTaskFormProps = {
   project: Project;
};

export default function NewTaskForm({ project }: NewTaskFormProps) {
   const {
      open,
      team,
      assignee,
      isPending,
      isEditing,
      itemToEdit,
      pendingTeam,
      errorMessage,
      setIsDraft,
      setAssignee,
      onOpenChange,
      handleSubmit,
      setAddToBacklog,
   } = useNewTaskForm(project);

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogTrigger className="btn btn-PRIMARY">
            New Task <Plus />
         </DialogTrigger>

         <DialogContent>
            <DialogHeader>
               <DialogTitle>{isEditing ? "Edit Task" : "New Task"}</DialogTitle>
               <DialogDescription hidden>{isEditing ? "Edit existing task" : "Create a new task."}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="py-8">
               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="title" className="mb-2 min-w-1/5 text-nowrap">
                     Title<span className="text-PRIMARY">*</span>
                  </Label>
                  <Input
                     disabled={isPending}
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
                  <Textarea
                     disabled={isPending}
                     name="body"
                     maxLength={300}
                     minLength={2}
                     rows={2}
                     defaultValue={itemToEdit?.body}
                  />
               </div>

               <div className="mb-5 items-center gap-10 lg:flex">
                  <Label htmlFor="priority" className="mb-2 min-w-1/5 text-nowrap">
                     Priority
                  </Label>

                  <Select disabled={isPending} name="priority" defaultValue={itemToEdit?.priority || "normal"}>
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

               <div className="mb-10 items-center gap-10 lg:flex">
                  <Label htmlFor="assignee" className="mb-2 min-w-1/5 text-nowrap">
                     Assign to
                  </Label>

                  <Select
                     disabled={isPending}
                     name="assignee"
                     value={itemToEdit?.assignee?.login || assignee}
                     onValueChange={setAssignee}
                  >
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
                        <SelectItem value={DEFAULT_NONE_SELECT_VALUE}>{DEFAULT_NONE_SELECT_VALUE}</SelectItem>
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

               {errorMessage && !isPending && (
                  <ErrorDisplay containerClassName="w-fit mb-3 ml-auto" error={errorMessage} />
               )}

               <div className="flex justify-end gap-3">
                  {isEditing ? (
                     <Button disabled={isPending} type="submit">
                        {isPending ? (
                           <>
                              Saving updates... <SpinnerIcon />
                           </>
                        ) : (
                           <>
                              Save updates <Check />
                           </>
                        )}
                     </Button>
                  ) : (
                     <>
                        {assignee && assignee !== DEFAULT_NONE_SELECT_VALUE ? (
                           <>
                              <Button
                                 disabled={isPending}
                                 type="submit"
                                 onClick={() => {
                                    setIsDraft(false);
                                    setAddToBacklog(true);
                                 }}
                              >
                                 {isPending ? (
                                    <>
                                       Adding to backlog... <SpinnerIcon />
                                    </>
                                 ) : (
                                    <>
                                       Add to backlog <Timer />
                                    </>
                                 )}
                              </Button>

                              <Button
                                 disabled={isPending || (!assignee && assignee === DEFAULT_NONE_SELECT_VALUE)}
                                 variant="PRIMARY"
                                 type="submit"
                                 onClick={() => {
                                    setIsDraft(false);
                                    setAddToBacklog(false);
                                 }}
                              >
                                 {isPending ? (
                                    <>
                                       Assigning task... <SpinnerIcon />
                                    </>
                                 ) : (
                                    <>
                                       Assign now <ArrowRight />
                                    </>
                                 )}
                              </Button>
                           </>
                        ) : (
                           <>
                              <Button
                                 disabled={isPending}
                                 type="submit"
                                 onClick={() => {
                                    setIsDraft(true);
                                    setAddToBacklog(false);
                                 }}
                              >
                                 {isPending ? (
                                    <>
                                       Saving draft... <SpinnerIcon />
                                    </>
                                 ) : (
                                    <>
                                       Save as draft <NotebookPen />
                                    </>
                                 )}
                              </Button>

                              <InfoTooltip
                                 content="No assignee selected!"
                                 trigger={
                                    <div className="btn btn-PRIMARY cursor-not-allowed opacity-25 active:scale-100">
                                       {isPending ? (
                                          <>
                                             Assigning task... <SpinnerIcon />
                                          </>
                                       ) : (
                                          <>
                                             Assign now <ArrowRight />
                                          </>
                                       )}
                                    </div>
                                 }
                              />
                           </>
                        )}
                     </>
                  )}
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}

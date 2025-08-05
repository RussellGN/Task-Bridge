import useBranchConventionAlertBar from "@/hooks/component-hooks/useBranchConventionAlertBar";
import { CheckSquare, Info } from "lucide-react";
import { Button } from "../ui/button";

export default function BranchConventionAlertBar() {
   const { shouldShow, loading, dontShowAgain } = useBranchConventionAlertBar();

   if (!shouldShow) return "";

   return (
      <div className="bg-WARNING/20 flex items-center gap-2 rounded-md p-1.5">
         <div className="text-WARNING grow rounded-md text-center text-xs">
            <Info className="mr-2 mb-1 inline" />
            Developers should append <b>{"_<task number>"}</b> to the names of git branches to allow tracking of task
            activity. For example branch <b>{"api_3"}</b> will provide the activity feed for task #3
         </div>

         <Button disabled={loading} size="xs" onClick={dontShowAgain} variant="WARNING">
            Dont show again <CheckSquare />
         </Button>
      </div>
   );
}

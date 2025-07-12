import useBranchConventionAlertBar from "@/hooks/component-hooks/useBranchConventionAlertBar";
import { CheckCircle, Info } from "lucide-react";
import { Button } from "../ui/button";

export default function BranchConventionAlertBar() {
   const { shouldShow, loading, dontShowAgain } = useBranchConventionAlertBar();

   if (!shouldShow) return "";

   return (
      <div className="mb-5 flex items-center gap-2">
         <div className="text-WARNING bg-WARNING/10 border-WARNING grow rounded-md border p-1.5 text-center text-xs">
            <Info className="mr-2 mb-1 inline" />
            Developers should append <b>{"_<task number>"}</b> to the names of git branches to allow tracking of task
            activity. For example branch <b>{"api_3"}</b> will provide the activity feed for task #3
         </div>

         <Button
            disabled={loading}
            size="sm"
            onClick={dontShowAgain}
            className="border-WARNING bg-WARNING/10 text-WARNING hover:bg-WARNING/20 hover:text-WARNING border"
         >
            Dont show again <CheckCircle />
         </Button>
      </div>
   );
}

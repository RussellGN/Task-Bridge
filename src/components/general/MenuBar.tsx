import { Info } from "lucide-react";
import { AccountManager } from "./AccountManager";

export default function MenuBar() {
   return (
      <div className="flex px-3 md:px-5 lg:px-8">
         <AccountManager />
         <div className="text-WARNING flex grow items-center justify-center gap-2 text-center text-sm">
            <Info />
            Developers should append <b>{"_<task number>"}</b> to the names of git branches to allow tracking of task
            activity e.g <b>{"feature/reports_23"}</b>
         </div>
      </div>
   );
}

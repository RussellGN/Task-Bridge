import Spinner from "@/components/general/Spinner";
import { Button } from "@/components/ui/button";
import useSignin from "@/hooks/route-hooks/useSignin";
import { GITHUB_AUTH_URL, GITHUB_INSTALL_URL } from "@/lib/constants";
import { AlertCircle, LogIn } from "lucide-react";
import { Link } from "react-router";

export default function Signin() {
   const { loading } = useSignin();

   return (
      <div className="flex flex-col items-center justify-center gap-3 pt-30 text-center">
         <img src="/public/github-placeholder-avatar.jpg" alt="GitHub logo" className="size-24 rounded-full" />

         <p>
            Integrate Your <span className="font-bold">GitHub</span> Account
         </p>

         <p className="text-foreground/70 mb-3 max-w-prose text-sm">
            <AlertCircle size={13} className="lucide-exempt -mt-0.5 mr-1 inline-block" />
            GitHub Integration is required for first time users of Task-bridge. If {"you've"} previously integrated,{" "}
            <Link
               to={loading ? "" : GITHUB_AUTH_URL}
               target={loading ? "" : "_blank"}
               className={loading ? "" : "text-PRIMARY underline underline-offset-2"}
            >
               Sign Back In.
            </Link>
         </p>

         <span className={loading ? "cursor-not-allowed" : ""}>
            <Button
               disabled={loading}
               asChild
               variant="PRIMARY"
               className={`btn btn-primary ${loading ? "pointer-events-none opacity-50" : ""}`}
            >
               <Link to={loading ? "" : GITHUB_INSTALL_URL} target={loading ? "" : "_blank"}>
                  {loading && <Spinner size="sm" />}
                  Integrate Account
                  <LogIn />
               </Link>
            </Button>
         </span>
      </div>
   );
}

import Spinner from "@/components/general/Spinner";
import { Button } from "@/components/ui/button";
import useSignin from "@/hooks/route-hooks/useSignin";
import { GITHUB_AUTH_URL, GITHUB_INSTALL_URL } from "@/lib/constants";
import { AlertCircle, LogIn, UserCircle } from "lucide-react";
import { Link } from "react-router";

export default function Signin() {
   const { loading } = useSignin();

   return (
      <div className="flex flex-col items-center justify-center gap-3 pt-30 text-center">
         <UserCircle className="lucide-exempt" size={100} />

         <p>Signin to GitHub</p>

         <p className="text-foreground/70 mb-3 max-w-prose text-sm">
            <AlertCircle size={13} className="lucide-exempt -mt-0.5 mr-1 inline-block" />
            GitHub Integration is required to use Task-bridge
         </p>

         <span className={loading ? "cursor-not-allowed" : ""}>
            <Button
               disabled={loading}
               asChild
               className={`btn btn-primary ${loading ? "pointer-events-none opacity-50" : ""}`}
            >
               <Link to={loading ? "" : GITHUB_INSTALL_URL} target={loading ? "" : "_blank"}>
                  {loading && <Spinner size="sm" />}
                  Sign In
                  <LogIn />
               </Link>
            </Button>
         </span>

         <div className="mt-10">or</div>

         <Link
            to={loading ? "" : GITHUB_AUTH_URL}
            target={loading ? "" : "_blank"}
            className={loading ? "" : "text-PRIMARY"}
         >
            Check GitHub for previous <br /> integration
         </Link>
      </div>
   );
}

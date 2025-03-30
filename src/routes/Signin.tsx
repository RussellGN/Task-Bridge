import Spinner from "@/components/general/Spinner";
import { Button } from "@/components/ui/button";
import useSignin from "@/hooks/route-hooks/useSignin";
import { GITHUB_AUTH_URL } from "@/lib/constants";
import { AlertTriangle, LogIn, UserCircle } from "lucide-react";
import { Link } from "react-router";

export default function Signin() {
   const { loading } = useSignin();

   return (
      <div className="pt-30 flex justify-center items-center flex-col gap-3 text-center">
         <UserCircle size={100} />
         <p>You need to sign into your GitHub account in order to proceed</p>
         <p className="text-xs text-foreground/70 max-w-prose mb-3">
            <AlertTriangle size={13} className="inline-block mr-1 -mt-0.5" />
            This is the account that will be
            <br />
            used on your behalf to interact with GitHub and <br /> cannot be changed.
         </p>

         <span className={loading ? "cursor-not-allowed" : ""}>
            <Button
               disabled={loading}
               asChild
               className={`btn btn-primary ${loading ? "pointer-events-none opacity-50 " : ""}`}
            >
               <Link to={loading ? "" : GITHUB_AUTH_URL} target={loading ? "" : "_blank"}>
                  {loading && <Spinner size="sm" />}
                  Sign in with Github
                  <LogIn />
               </Link>
            </Button>
         </span>
      </div>
   );
}

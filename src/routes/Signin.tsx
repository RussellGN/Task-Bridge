import Spinner from "@/components/general/Spinner";
import { Button } from "@/components/ui/button";
import useSignin from "@/hooks/route-hooks/useSignin";
import { GITHUB_AUTH_URL, GITHUB_INSTALL_URL } from "@/lib/constants";
import { AlertTriangle, LogIn, UserCircle } from "lucide-react";
import { Link } from "react-router";

export default function Signin() {
   const { loading } = useSignin();

   return (
      <div className="flex flex-col items-center justify-center gap-3 pt-30 text-center">
         <UserCircle className="lucide-exempt" size={100} />

         <p>You need to allow integration with your GitHub account in order to proceed</p>

         <p className="text-foreground/70 mb-3 max-w-prose text-sm">
            <AlertTriangle size={13} className="-mt-0.5 mr-1 inline-block" />
            This is will enable the app to interact with GitHub <br /> on behalf of your account
         </p>

         <span className={loading ? "cursor-not-allowed" : ""}>
            <Button
               disabled={loading}
               asChild
               className={`btn btn-primary ${loading ? "pointer-events-none opacity-50" : ""}`}
            >
               <Link to={loading ? "" : GITHUB_INSTALL_URL} target={loading ? "" : "_blank"}>
                  {loading && <Spinner size="sm" />}
                  Integrate Github Account
                  <LogIn />
               </Link>
            </Button>
         </span>

         <div className="">- or -</div>

         <Link
            to={loading ? "" : GITHUB_AUTH_URL}
            target={loading ? "" : "_blank"}
            className={loading ? "" : "text-PRIMARY underline"}
         >
            Check GitHub for previous <br /> integration
         </Link>
      </div>
   );
}

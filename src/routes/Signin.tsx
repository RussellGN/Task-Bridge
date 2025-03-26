import { Button } from "@/components/ui/button";
import { GITHUB_AUTH_URL } from "@/lib/constants";
import { LogIn, UserCircle } from "lucide-react";
import { Link } from "react-router";

export default function Signin() {
   return (
      <div className="pt-30 flex justify-center items-center flex-col gap-4 text-center">
         <UserCircle size={100} />

         <p>
            You need to sign into your GitHub account <br /> in order to proceed
         </p>

         <Button asChild className="btn btn-primary">
            <Link to={GITHUB_AUTH_URL} target="_blank">
               Signin with Github
               <LogIn />
            </Link>
         </Button>
      </div>
   );
}

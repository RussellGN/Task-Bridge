import Spinner from "@/components/general/Spinner";
import { UserAvatar } from "@/components/general/UserAvatar";
import { UserInterface } from "@/lib/interfaces";
import { TriangleAlert } from "lucide-react";

type DefaultTabProps = {
   loading: boolean;
   error: Error | string | null;
   user: UserInterface | null;
};

export default function HomeTab({ loading, error, user }: DefaultTabProps) {
   return (
      <div className="pt-30 font-semibold flex flex-col items-center justify-center gap-3 text-center">
         {loading ? (
            <>
               <Spinner />
               <p>Loading...</p>
            </>
         ) : error ? (
            <>
               <TriangleAlert className="text-DANGER" />
               <p className="max-w-prose text-DANGER break-words">{error.toString()}</p>
            </>
         ) : user ? (
            <>
               <UserAvatar user={user} />
               <h1 className="text-lg">
                  Welcome <span className="text-PRIMARY"> {user.login}</span>!
               </h1>
            </>
         ) : (
            ""
         )}
      </div>
   );
}

import Spinner from "@/components/general/Spinner";
import { UserAvatar } from "@/components/general/UserAvatar";
import { Button } from "@/components/ui/button";
import useHomeTab from "@/hooks/component-hooks/useHomeTab";
import { UserInterface } from "@/lib/interfaces";
import { ArrowUpRight, TriangleAlert } from "lucide-react";
import { Link } from "react-router";

type DefaultTabProps = {
   loading: boolean;
   error: Error | string | null;
   user: UserInterface | null;
};

export default function HomeTab({ loading, error, user }: DefaultTabProps) {
   const { appVersion } = useHomeTab();

   return (
      <div className="pt-30 font-semibold h-full flex flex-col items-center  gap-3 text-center">
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

               <p>Get started by</p>

               <div className="bg-foreground/5 w-fit rounded-lg p-4 mt-4 flex text-center justify-center items-center gap-3 ">
                  <Button size="sm" asChild variant="link" className="text-foreground/70 dark:text-foreground/50 ">
                     <Link to={{ search: "?tab=new" }}>
                        Creating a new project
                        <ArrowUpRight />
                     </Link>
                  </Button>
                  <div className="w-0.5  h-6 bg-foreground/20"></div>

                  <Button size="sm" asChild variant="link" className="text-foreground/70 dark:text-foreground/50 ">
                     <Link to={{ search: "?tab=all" }}>
                        Managing existing projects
                        <ArrowUpRight />
                     </Link>
                  </Button>
                  <div className="w-0.5  h-6 bg-foreground/20"></div>

                  <Button size="sm" asChild variant="link" className="text-foreground/70 dark:text-foreground/50 ">
                     <Link to="/settings">
                        Configuring preferences
                        <ArrowUpRight />
                     </Link>
                  </Button>
               </div>

               <div className="mt-auto">
                  <p className="text-muted-foreground text-xs">
                     &copy; {new Date().getFullYear()} Task Bridge <br /> {appVersion}
                  </p>
               </div>
            </>
         ) : (
            ""
         )}
      </div>
   );
}

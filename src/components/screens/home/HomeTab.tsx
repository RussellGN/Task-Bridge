import Spinner from "@/components/general/Spinner";
import { UserAvatar } from "@/components/general/UserAvatar";
import { Button } from "@/components/ui/button";
import useHomeTab from "@/hooks/component-hooks/useHomeTab";
import { UserInterface } from "@/types/interfaces";
import { ArrowUpRight, TriangleAlert } from "lucide-react";
import { Link } from "react-router";

type DefaultTabProps = {
   loading: boolean;
   error: Error | string | null;
   user: UserInterface | undefined | null;
};

export default function HomeTab({ loading, error, user }: DefaultTabProps) {
   const { appVersion } = useHomeTab();

   return (
      <div className="flex h-full flex-col items-center gap-3 pt-30 text-center font-semibold">
         {loading ? (
            <>
               <Spinner />
               <p>Loading...</p>
            </>
         ) : error ? (
            <>
               <TriangleAlert className="text-DANGER" />
               <p className="text-DANGER max-w-prose break-words">{error.toString()}</p>
            </>
         ) : user ? (
            <>
               <UserAvatar user={user} />
               <h1 className="text-lg">
                  Welcome <span className="text-PRIMARY"> {user.login}</span>!
               </h1>

               <p>Get started by</p>

               <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-center">
                  <Button size="sm" asChild variant="link" className="text-foreground/70 dark:text-foreground/50">
                     <Link to={{ search: "?tab=new" }}>
                        Creating a new project
                        <ArrowUpRight />
                     </Link>
                  </Button>
                  <div className="bg-foreground/20 h-6 w-0.5"></div>

                  <Button size="sm" asChild variant="link" className="text-foreground/70 dark:text-foreground/50">
                     <Link to={{ search: "?tab=all" }}>
                        Managing existing projects
                        <ArrowUpRight />
                     </Link>
                  </Button>
                  <div className="bg-foreground/20 h-6 w-0.5"></div>

                  <Button size="sm" asChild variant="link" className="text-foreground/70 dark:text-foreground/50">
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

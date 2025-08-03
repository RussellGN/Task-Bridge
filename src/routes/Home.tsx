import useHome from "@/hooks/route-hooks/useHome";
import Spinner from "@/components/general/Spinner";
import { UserAvatar } from "@/components/general/UserAvatar";
import { Button } from "@/components/ui/button";
import useAppVersion from "@/hooks/useAppVersion";
import { ArrowUpRight, TriangleAlert } from "lucide-react";
import { Link } from "react-router";
import NewProjectForm from "@/components/screens/projects-explorer/NewProjectForm";

export default function Home() {
   const appVersion = useAppVersion();
   const { user, loading, error } = useHome();

   return (
      <div className="flex h-full flex-col items-center gap-3 p-4 pt-30 text-center font-semibold">
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
                  <NewProjectForm
                     trigger={
                        <Button size="sm" variant="link" className="text-foreground/70 dark:text-foreground/50">
                           Creating a new project
                           <ArrowUpRight />
                        </Button>
                     }
                  />
                  <div className="bg-foreground/20 h-6 w-0.5"></div>

                  <Button size="sm" asChild variant="link" className="text-foreground/70 dark:text-foreground/50">
                     <Link to="/projects">
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
                     &copy; {new Date().getFullYear()} Task Bridge V {appVersion}
                  </p>
               </div>
            </>
         ) : (
            ""
         )}
      </div>
   );
}

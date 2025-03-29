import Spinner from "@/components/general/Spinner";
import useHome from "@/hooks/route-hooks/useHome";
import { TriangleAlert } from "lucide-react";

export default function Home() {
   const { user, loading, error } = useHome();

   return (
      <div className="p-5">
         {loading ? (
            <div className="flex flex-col items-center justify-center gap-3">
               <Spinner />
               <p className="font-semibold">Loading...</p>
            </div>
         ) : error ? (
            <div className="flex flex-col items-center gap-3">
               <TriangleAlert className="text-red-400" />
               <p className="font-semibold max-w-prose text-center text-red-400 break-words">{error.toString()}</p>
            </div>
         ) : user ? (
            <div className="w-fit  flex items-center gap-3">
               <img src={user.avatar_url} alt={`${user.login}'s profile`} className="size-9 rounded-full" />
               <h2 className="text-lg font-bold">
                  Welcome <span className="text-yellow-300"> {user.login}</span>!
               </h2>
            </div>
         ) : (
            ""
         )}
      </div>
   );
}

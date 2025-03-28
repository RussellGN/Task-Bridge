import Spinner from "@/components/general/Spinner";
import useHome from "@/hooks/route-hooks/useHome";
import { TriangleAlert } from "lucide-react";

export default function Home() {
   const { user, loading, error } = useHome();

   return (
      <div className="p-5">
         <h1 className="mb-5">Home</h1>

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
            <div className="w-full max-w-md p-5 bg-white shadow-md rounded-md flex flex-col items-center">
               <img src={user.avatar_url} alt={`${user.login}'s profile`} className="w-20 h-20 rounded-full mb-3" />
               <h2 className="text-lg font-bold mb-3">Welcome, {user.login}!</h2>
               <p className="text-sm text-gray-600">Email: {user.email}</p>
            </div>
         ) : (
            ""
         )}
      </div>
   );
}

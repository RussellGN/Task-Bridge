import Spinner from "@/components/general/Spinner";
import useHome from "@/hooks/route-hooks/useHome";
import { TriangleAlert } from "lucide-react";

export default function Home() {
   const { token, loading, error } = useHome();

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
               <p className="font-semibold max-w-prose text-center text-red-400">{error.message}</p>
            </div>
         ) : token ? (
            <div className="flex flex-col items-center gap-3">
               <p className="font-semibold">Token:</p>
               <ul className="list-disc">
                  <li>
                     <strong>Access Token:</strong> {token.accessToken}
                  </li>
                  <li>
                     <strong>Refresh Token:</strong> {token.refreshToken}
                  </li>
                  <li>
                     <strong>Expires In:</strong> {token.expiresIn}
                  </li>
                  <li>
                     <strong>Token Type:</strong> {token.tokenType}
                  </li>
                  <li>
                     <strong>Scope:</strong> {token.scope}
                  </li>
                  <li>
                     <strong>Refresh Token Expires In :</strong> {token.refreshTokenExpiresIn}
                  </li>
               </ul>
            </div>
         ) : (
            ""
         )}
      </div>
   );
}

import { useState } from "react";
import useGetUser from "../backend-api-hooks/internet-independant/useGetUser";

export default function useAccountManager() {
   const { user } = useGetUser();
   const [showSignoutDialog, setShowSignoutDialog] = useState(false);

   function signout() {
      console.log("User signed out");
   }

   return { user, showSignoutDialog, signout, setShowSignoutDialog };
}

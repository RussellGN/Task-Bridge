import { useState } from "react";
import useGetUser from "../backend-api-hooks/internet-independant/useGetUser";
import useSignout from "../backend-api-hooks/internet-independant/useSignout";

export default function useAccountManager() {
   const { user, loading: userLoading } = useGetUser();
   const { isPending: isSigningOut, signout } = useSignout();
   const [showSignoutDialog, setShowSignoutDialog] = useState(false);

   return {
      user,
      isSigningOut,
      userLoading,
      showSignoutDialog,
      signout: () => {
         signout();
         setShowSignoutDialog(false);
      },
      setShowSignoutDialog,
   };
}

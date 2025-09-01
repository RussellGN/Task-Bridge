import { useEffect, useState } from "react";
import { checkAuth } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router";
import useGetUser from "../backend-api-hooks/internet-independant/useGetUser";
import useAppPreferences from "../useAppPreferences";

export default function useWelcome() {
   const [isFirstMount, setIsFirstMount] = useState(true);
   const { appPreferences, updateAppPreferencesManually } = useAppPreferences();
   const { user, error, loading, getUser } = useGetUser();
   const [searchParams, setSearchParams] = useSearchParams();
   const activeTab = searchParams.get("tab") || "home";
   const navigate = useNavigate();

   useEffect(() => {
      // checkAuth should not raise an error, crash if it does
      checkAuth().then((isAuthed) => {
         if (!isAuthed) {
            // alertError("[useHome] You are not authenticated. Please sign in.");
            navigate("/");
         } else {
            if (appPreferences?.is_not_first_launch && isFirstMount) navigate("/projects");
            else {
               setIsFirstMount(false);
               updateAppPreferencesManually({ is_not_first_launch: true });
            }
            getUser();
         }
      });
   }, [appPreferences?.is_not_first_launch]);

   function setActiveTab(tab: string) {
      setSearchParams((prev) => {
         const newParams = new URLSearchParams(prev.toString());
         newParams.set("tab", tab);
         return newParams;
      });
   }

   return { loading, user, error, activeTab, setActiveTab };
}

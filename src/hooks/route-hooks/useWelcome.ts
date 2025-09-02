import { useEffect } from "react";
import { checkAuth } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router";
import useGetUser from "../backend-api-hooks/internet-independant/useGetUser";
import useAppPreferences from "../useAppPreferences";

export default function useWelcome() {
   const { updateAppPreferencesManually, reloadAppPreferences: loadAppPreferences } = useAppPreferences();
   const { user, error, loading, getUser } = useGetUser();
   const [searchParams, setSearchParams] = useSearchParams();
   const activeTab = searchParams.get("tab") || "home";
   const navigate = useNavigate();

   useEffect(() => {
      // checkAuth should not raise an error, crash if it does
      checkAuth().then((isAuthed) => {
         if (isAuthed) {
            loadAppPreferences().then(({ data: appPreferences }) => {
               console.warn("not_first_launch", appPreferences?.not_first_launch);
               if (appPreferences?.not_first_launch) navigate("/projects");
               else {
                  updateAppPreferencesManually({ not_first_launch: true });
                  getUser();
               }
            });
         } else {
            // alertError("[useHome] You are not authenticated. Please sign in.");
            navigate("/");
         }
      });
   }, []);

   function setActiveTab(tab: string) {
      setSearchParams((prev) => {
         const newParams = new URLSearchParams(prev.toString());
         newParams.set("tab", tab);
         return newParams;
      });
   }

   return { loading, user, error, activeTab, setActiveTab };
}

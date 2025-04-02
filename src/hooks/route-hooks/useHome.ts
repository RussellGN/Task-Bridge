import { useEffect } from "react";
import { alertError, checkAuth } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router";
import useGetUser from "../backend-api-hooks/useGetUser";

export default function useHome() {
   const { user, error, loading, getUser } = useGetUser();
   const [searchParams, setSearchParams] = useSearchParams();
   const activeTab = searchParams.get("tab") || "home";
   const navigate = useNavigate();

   useEffect(() => {
      // checkAuth should not raise an error, crash if it does
      checkAuth().then((isAuthed) => {
         if (!isAuthed) {
            alertError("[useHome] You are not authenticated. Please sign in.");
            navigate("/");
         } else {
            getUser();
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

import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import useGetUser from "./backend-api-hooks/internet-independant/useGetUser";
import useLocalProjectsList from "./backend-api-hooks/internet-independant/useLocalProjectsList";

// ensures user and local projects are loaded, then hides splash screen
export default function useSetup() {
   const [isFirstRun, setIsFirstRun] = useState(true);
   const { loading } = useGetUser();
   const { isLoading } = useLocalProjectsList();

   useEffect(() => {
      if (isFirstRun && !loading && !isLoading) {
         setTimeout(() => {
            invoke("hide_splash").then(() => setIsFirstRun(false));
         }, 2000);
      }
   }, [loading, isLoading, isFirstRun]);
}

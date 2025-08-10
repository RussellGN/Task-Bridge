import { load } from "@tauri-apps/plugin-store";
import { STORE_PATH } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { alertError, alertSuccess, logInfo } from "@/lib/logging";
import { useClient } from "@/providers/ReactQueryProvider";

export default function useSignout() {
   const navigate = useNavigate();
   const client = useClient();

   const { isPending, mutate } = useMutation({
      mutationFn: async () => {
         const store = await load(STORE_PATH);
         logInfo("[useSignout] clearing store");
         await store.clear();
      },
      onError: (err: Error | string) => {
         const errorMessage = err instanceof Error ? err.message : err;
         alertError("[useSignout] Error signing out:", errorMessage);
      },
      onSuccess: () => {
         client.clear();
         navigate("/");
         alertSuccess("You signed out!");
      },
   });

   return { signout: mutate, isPending };
}

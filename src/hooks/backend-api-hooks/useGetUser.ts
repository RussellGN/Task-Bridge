import { STORE_PATH } from "@/lib/constants";
import { UserInterface } from "@/lib/interfaces";
import { logInfo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";

/** authenticated-user data from cache, store, or github if not found. */
export default function useGetUser() {
   const { data, error, isLoading, refetch } = useQuery<UserInterface, string>({
      queryKey: ["user"],
      queryFn: async () => {
         const store = await load(STORE_PATH);
         const user = await store.get<UserInterface>("user");
         if (user) return user;
         logInfo("[useGetUser] User not found, fetching from backend");
         return await invoke<UserInterface>("fetch_save_and_return_user");
      },
   });

   return { user: data, error, loading: isLoading, getUser: refetch };
}

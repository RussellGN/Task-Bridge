import { STORE_PATH } from "@/lib/constants";
import { Author } from "@/types/interfaces";
import { logInfo } from "@/lib/logging";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";

/** authenticated-user data from cache, store, or github if not found. */
export default function useGetUser() {
   const { data, error, isLoading, refetch } = useQuery<Author, string>({
      queryKey: ["user"],
      queryFn: async () => {
         const store = await load(STORE_PATH);
         const user = await store.get<Author>("user");
         if (user) return user;
         logInfo("[useGetUser] User not found, fetching from backend");
         return await invoke<Author>("fetch_save_and_return_user");
      },
   });

   return { user: data, error, loading: isLoading, getUser: refetch };
}

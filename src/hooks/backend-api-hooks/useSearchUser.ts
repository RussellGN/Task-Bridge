import { STORE_PATH } from "@/lib/constants";
import { UserInterface } from "@/lib/interfaces";
import { logInfo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";

/** get searched github-user from cache, store, or github if not found. */
export default function useSearchUser(search: string) {
   const { isLoading: loading, refetch: searchForUser } = useQuery<UserInterface, string>({
      queryKey: ["user", search],
      queryFn: async () => {
         const store = await load(STORE_PATH);
         const searchedUser = await store.get<UserInterface>(`team-member-${search}`);
         if (searchedUser) return searchedUser;
         logInfo("[useSearchUser] Searched user not cached nor stored, fetching from github");
         return await invoke<UserInterface>("fetch_save_and_return_searched_user", { search });
      },
   });

   return { loading, searchForUser };
}

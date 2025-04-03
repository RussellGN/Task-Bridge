import { AuthorInterface } from "@/lib/interfaces";
import { logInfo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

/** get query matching users from cache, or github if not found. */
export default function useSearchUsers(query: string) {
   const { data, error, isLoading, refetch } = useQuery<AuthorInterface[], string>({
      queryKey: ["users", query],
      queryFn: async () => {
         logInfo("[useSearchUsers] Starting search for users matching query: " + query);
         return await invoke<AuthorInterface[]>("find_users_matching_query", { query });
      },
   });

   return { loading: isLoading, queriedUsers: data, error, startSearch: refetch };
}

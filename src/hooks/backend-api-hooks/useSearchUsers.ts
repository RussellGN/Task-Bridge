import { Author } from "@/types/interfaces";
import { alertError, logInfo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

/** get query matching users from cache, or github if not found. */
export default function useSearchUsers(query: string) {
   const [lastFetchHappenedAt, setLastFetchHappenedAt] = useState(0);
   const MINIMUM_ALLOWABLE_FETCH_INTERVAL_IN_MS = 7500; // 7.5 seconds (8 times per minute)

   const { data, error, isLoading, refetch } = useQuery<Author[], string>({
      queryKey: ["users", query],
      queryFn: async () => {
         logInfo("[useSearchUsers] Starting search for users matching query: " + query);
         return await invoke<Author[]>("find_users_matching_query", { query });
      },
   });

   function rateLimitedRefetch() {
      const now = Date.now();
      if (now - lastFetchHappenedAt >= MINIMUM_ALLOWABLE_FETCH_INTERVAL_IN_MS) {
         setLastFetchHappenedAt(now);
         refetch();
      } else {
         alertError(
            "[rateLimitedRefetch] Search aborted to respect GitHub rate limits (10 searches per minute). Please wait a few seconds before trying again.",
         );
      }
   }

   return { loading: isLoading, queriedUsers: data, error, startSearch: rateLimitedRefetch };
}

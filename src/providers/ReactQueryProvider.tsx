import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         enabled: false,
         retry: false,
         refetchOnWindowFocus: false,
         refetchOnReconnect: false,
         refetchInterval: false,
         refetchOnMount: false,
         staleTime: Infinity,
      },
   },
});

export default function ReactQueryProvider({ children }: PropsWithChildren) {
   return (
      <QueryClientProvider client={queryClient}>
         {children}
         <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
   );
}

export const useClient = () => useQueryClient(queryClient);

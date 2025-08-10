import { dbg } from "@/lib/logging";
import React from "react";

const syncedProjectsContext = React.createContext<{
   syncedProjectsMap: Map<string, string>;
   setSyncedProjectsMap: React.Dispatch<React.SetStateAction<Map<string, string>>>;
} | null>(null);

export default function SyncedProjectsProvider({ children }: { children: React.ReactNode }) {
   const [syncedProjectsMap, setSyncedProjectsMap] = React.useState<Map<string, string>>(new Map());

   return (
      <syncedProjectsContext.Provider
         value={{
            syncedProjectsMap,
            setSyncedProjectsMap,
         }}
      >
         {children}
      </syncedProjectsContext.Provider>
   );
}

export function useSyncedProjects() {
   const context = React.useContext(syncedProjectsContext);
   if (!context) throw new Error("useSyncedProjects must be used within a SyncedProjectsProvider");

   function syncIfNotSynced(projectId: string, syncFunc: () => void) {
      if (context?.syncedProjectsMap.has(projectId)) {
         dbg("[useSyncedProjects] Project is already synced:", projectId);
         return;
      }
      syncFunc();
      context?.setSyncedProjectsMap((prevMap) => {
         const newMap = new Map(prevMap);
         newMap.set(projectId, "synced");
         return newMap;
      });
   }

   return { syncIfNotSynced };
}

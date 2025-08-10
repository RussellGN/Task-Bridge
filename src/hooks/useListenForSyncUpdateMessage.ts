import { stringifyAndRemoveQuotes } from "@/lib/utils";
import { alertError, alertSuccess, dbg } from "@/lib/logging";
import { ProjectSyncResult } from "@/types/interfaces";
import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

export default function useListenForSyncUpdateMessage() {
   useEffect(() => {
      let unlisten = () => dbg("project sync result listener - unlisten func was not set");

      dbg("[useListenForSyncUpdateMessage] registering project sync result listener");
      listen<ProjectSyncResult>("project_sync_result", (e) => {
         if (e.payload.was_successfull) alertSuccess(e.payload.message);
         else alertError(e.payload.message);
      })
         .then((un) => (unlisten = un))
         .catch((e) =>
            dbg(
               "[useListenForSyncUpdateMessage] error registering project sync result listener: " +
                  stringifyAndRemoveQuotes(e),
            ),
         );

      return unlisten();
   });
}

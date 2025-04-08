import { useEffect, useState } from "react";
import { alertError, logInfo } from "@/lib/utils";
import { Author } from "@/types/interfaces";
import useSearchUsers from "../backend-api-hooks/useSearchUsers";
import { TEAM_LOGINS_SEPERATOR } from "@/lib/constants";

export default function useTeamSelector() {
   const [team, setTeam] = useState<Author[]>([]);
   const [query, setQuery] = useState("");
   const { error, loading, queriedUsers, startSearch } = useSearchUsers(query);
   const teamInputValue = team.map((user) => `${user.login}`).join(TEAM_LOGINS_SEPERATOR);

   useEffect(() => {
      if (error) alertError("[useTeamSelector] " + error);
      if (queriedUsers) logInfo("[useTeamSelector] Queried users: ", queriedUsers);
      if (team.length > 0) logInfo("[useTeamSelector] Team: ", team);
   }, [error]);

   function handleSearch() {
      if (query.length < 3) alertError("[handleSearch] Please enter a query with at least 3 characters.");
      else startSearch();
   }

   function selectUser(user: Author) {
      setTeam((prev) => {
         const newTeam = [...prev, user];
         return newTeam.filter((u, i) => newTeam.findIndex((user) => user.id === u.id) === i); // remove duplicates
      });
      setQuery("");
   }

   function removeUser(user: Author) {
      setTeam((prev) => prev.filter((u) => u.id !== user.id));
   }

   return { team, query, loading, queriedUsers, teamInputValue, setQuery, selectUser, removeUser, handleSearch };
}

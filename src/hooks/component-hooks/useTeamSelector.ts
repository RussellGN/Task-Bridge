import { useEffect, useState } from "react";
import { alertError, logInfo } from "@/lib/utils";
import { AuthorInterface } from "@/lib/interfaces";
import useSearchUsers from "../backend-api-hooks/useSearchUsers";

export default function useTeamSelector() {
   const [team, setTeam] = useState<AuthorInterface[]>([]);
   const [query, setQuery] = useState("");
   const { error, loading, queriedUsers, startSearch } = useSearchUsers(query);
   const teamInputValue = team.map((user) => `${user.login}-${user.id}`).join(", ");

   useEffect(() => {
      if (error) alertError("[useTeamSelector] " + error);
      if (queriedUsers) logInfo("[useTeamSelector] Queried users: ", queriedUsers);
      if (team.length > 0) logInfo("[useTeamSelector] Team: ", team);
   }, [error]);

   function handleSearch() {
      if (query.length < 3) alertError("[handleSearch] Please enter a query with at least 3 characters.");
      else startSearch();
   }

   function selectUser(user: AuthorInterface) {
      setTeam((prev) => {
         const newTeam = [...prev, user];
         return newTeam.filter((u, i) => newTeam.findIndex((user) => user.id === u.id) === i); // remove duplicates
      });
      setQuery("");
   }

   function removeUser(user: AuthorInterface) {
      setTeam((prev) => prev.filter((u) => u.id !== user.id));
   }

   return { team, query, loading, queriedUsers, teamInputValue, setQuery, selectUser, removeUser, handleSearch };
}

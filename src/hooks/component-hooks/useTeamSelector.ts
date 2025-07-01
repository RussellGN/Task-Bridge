import { useEffect, useState } from "react";
import { alertError, logInfo } from "@/lib/utils";
import { PossiblyPendingAuthor } from "@/types/interfaces";
import useSearchUsers from "../backend-api-hooks/internet-dependant/useSearchUsers";
import { TEAM_LOGINS_SEPERATOR } from "@/lib/constants";
import useGetUser from "../backend-api-hooks/internet-independant/useGetUser";

export default function useTeamSelector(defaultTeam?: PossiblyPendingAuthor[]) {
   const [team, setTeam] = useState<PossiblyPendingAuthor[]>(defaultTeam || []);
   const [query, setQuery] = useState("");
   const { error, loading, queriedUsers, startSearch } = useSearchUsers(query);
   const { user: loggedInUser } = useGetUser();
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

   function selectUser(user: PossiblyPendingAuthor) {
      if (user.login === loggedInUser?.login) {
         alertError("[selectUser] You cannot invite yourself to the team. You are already a member.");
         return;
      }

      setTeam((prev) => {
         const newTeam = [...prev, { ...user, pending: true } as PossiblyPendingAuthor];
         return newTeam.filter((u, i) => newTeam.findIndex((user) => user.id === u.id) === i); // remove duplicates
      });
      setQuery("");
   }

   function removeUser(user: PossiblyPendingAuthor) {
      setTeam((prev) => prev.filter((u) => u.id !== user.id));
   }

   return { team, query, loading, queriedUsers, teamInputValue, setQuery, selectUser, removeUser, handleSearch };
}

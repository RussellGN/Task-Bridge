import useSearchUser from "../backend-api-hooks/useSearchUser";
import { useState } from "react";
import { alertError } from "@/lib/utils";
import { UserInterface } from "@/lib/interfaces";

export default function useTeamSelector() {
   const [team, setTeam] = useState<UserInterface[]>([]);
   const [search, setSearch] = useState("");
   const [actualSearchQuery, setActualSearchQuery] = useState("");
   const { loading, searchForUser } = useSearchUser(actualSearchQuery);
   const teamInputValue = team.map((user) => user.email).join(", ");

   function handleSearch() {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(search)) {
         alertError("[handleSearch] Invalid email format.");
         return;
      }

      const alreadyAdded = team.find((u) => u.email === search);
      if (alreadyAdded) {
         alertError(`[handleSearch] ${alreadyAdded.login} was already added to team.`);
         return;
      } else {
         setActualSearchQuery(search);
         searchForUser()
            .then(({ data, error, isSuccess }) => {
               if (isSuccess) setTeam((prev) => [...prev, data]);
               else if (error) alertError("[handleSearch] " + error);
               else alertError("[handleSearch] Something went wrong. Please try again.");
            })
            .catch((err) => alertError("[handleSearch] Error: " + JSON.stringify(err)));
      }
   }

   return { team, search, loading, teamInputValue, setSearch, handleSearch };
}

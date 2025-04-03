import useTeamSelector from "@/hooks/component-hooks/useTeamSelector";
import TeamUserCard from "./TeamUserCard";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import Spinner from "./Spinner";

export default function TeamSelector() {
   const { team, search, loading, teamInputValue, setSearch, handleSearch } = useTeamSelector();

   return (
      <div className="bg-background rounded-sm p-3">
         <input type="hidden" name="team" id="team" value={teamInputValue} readOnly />

         <div className="flex flex-wrap gap-2">
            {team.length === 0 && <p className="text-muted-foreground text-sm">0 team members added.</p>}
            {team.map((user) => (
               <TeamUserCard key={user.login} user={user} onRemove={() => {}} />
            ))}
         </div>

         <div className="mt-5 flex w-fit items-center gap-2">
            <Input
               disabled={loading}
               type="email"
               maxLength={100}
               placeholder="Enter GitHub user's full email address"
               className="w-[40ch]"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            {loading ? (
               <Spinner />
            ) : (
               <Button disabled={loading} onClick={handleSearch} type="button" variant="outline" size="icon">
                  <Search />
               </Button>
            )}
         </div>
      </div>
   );
}

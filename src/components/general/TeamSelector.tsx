import useTeamSelector from "@/hooks/component-hooks/useTeamSelector";
import TeamUserCard from "./TeamUserCard";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import Spinner from "./Spinner";
import { PossiblyPendingAuthor } from "@/types/interfaces";
import { cn } from "@/lib/utils";

export default function TeamSelector({
   disabled,
   defaultTeam,
   className,
}: {
   disabled?: boolean;
   defaultTeam?: PossiblyPendingAuthor[];
   className?: string;
}) {
   const { team, query, loading, queriedUsers, teamInputValue, setQuery, selectUser, removeUser, handleSearch } =
      useTeamSelector(defaultTeam);

   return (
      <div className={cn("bg-background rounded-sm p-3", className)}>
         <input type="hidden" name="team" id="team" value={teamInputValue} readOnly />

         <div className="flex flex-wrap gap-2">
            {team.length === 0 && <p className="text-muted-foreground text-sm">0 team members added.</p>}
            {team.map((user) => (
               <TeamUserCard
                  pending={user.pending}
                  showPendingState
                  key={user.login}
                  user={user}
                  onRemove={disabled ? undefined : () => removeUser(user)}
               />
            ))}
         </div>

         <div className="mt-5 flex w-fit items-center gap-2">
            <div className="relative">
               <Input
                  minLength={3}
                  maxLength={50}
                  placeholder="GitHub user's full username or PUBLIC email"
                  className={"w-[40ch] " + (loading ? "opacity-30" : "")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading || disabled}
               />
               {queriedUsers !== undefined && (
                  <div className="bg-background/50 border-foreground/20 absolute top-full left-0 mt-2 max-h-[25ch] w-full overflow-y-auto rounded-md border shadow-lg">
                     {queriedUsers.length === 0 ? (
                        <p className="text-muted-foreground p-2 text-center text-sm">No results found.</p>
                     ) : (
                        queriedUsers.map((user) => (
                           <div
                              onClick={() => selectUser(user)}
                              key={user.id}
                              className="cursor-pointer opacity-90 hover:opacity-100"
                           >
                              <TeamUserCard key={user.login} user={user} />
                           </div>
                        ))
                     )}
                  </div>
               )}
            </div>
            {loading ? (
               <Spinner />
            ) : (
               <Button
                  disabled={loading || disabled}
                  onClick={handleSearch}
                  type="button"
                  variant="outline"
                  size="icon"
               >
                  <Search />
               </Button>
            )}
         </div>
      </div>
   );
}

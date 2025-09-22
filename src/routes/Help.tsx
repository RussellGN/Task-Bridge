import useAppVersion from "@/hooks/useAppVersion";
import { DOWNLOAD_URL, DOWNLOAD_URL_TEXT, GITHUB_REPO_URL } from "@/lib/constants";
import { HelpCircle } from "lucide-react";

export default function Help() {
   const appVersion = useAppVersion();

   return (
      <div>
         <div className="mb-4 flex items-center justify-center gap-2">
            User Guide <HelpCircle className="mt-0.5" />
         </div>

         <div className="mx-auto max-h-[80vh] max-w-4xl space-y-8 overflow-y-auto lg:p-8">
            {/* 1. what is task bridge */}
            <section>
               <h2 className="mb-3 text-xl font-semibold">What is Task Bridge?</h2>
               <div className="text-muted-foreground space-y-2 text-sm">
                  <p>
                     Task Bridge is a desktop-based project management solution built specifically around GitHub. It
                     simplifies work management and project oversight for GitHub-averse project managers while
                     leveraging GitHub&apos;s powerful infrastructure.
                  </p>
                  <p>
                     The app automatically creates GitHub repositories, manages issues as tasks, tracks pull requests,
                     and provides a clean project dashboard without requiring deep GitHub knowledge.
                  </p>
               </div>
            </section>

            {/* 2. how to use task bridge */}
            <section>
               <h2 className="mb-3 text-xl font-semibold">How to Use Task Bridge</h2>
               <div className="text-muted-foreground space-y-3 text-sm">
                  <div>
                     <h3 className="text-foreground mb-2 font-medium">Getting Started:</h3>
                     <ol className="ml-4 list-inside list-decimal space-y-1">
                        <li>Authorize Task Bridge with your GitHub account</li>
                        <li>Sync existing GitHub repositories as projects</li>
                        <li>Create new projects that translate to GitHub repositories</li>
                        <li>Add team members by their GitHub usernames</li>
                        <li>Start creating and managing tasks on your project dashboard</li>
                        <li>View project stats and configure preferences</li>
                     </ol>
                  </div>
                  <div>
                     <h3 className="text-foreground mb-2 font-medium">Task Management:</h3>
                     <ul className="ml-4 list-inside list-disc space-y-1">
                        <li>
                           <strong>Drafts:</strong> Create draft tasks that stay local and don&apos;t sync to GitHub
                        </li>
                        <li>
                           <strong>Tasks:</strong> Real tasks that create corresponding GitHub issues
                        </li>
                        <li>
                           <strong>Backlog:</strong> Tasks waiting to be assigned
                        </li>
                        <li>
                           <strong>In Progress:</strong> Tasks which have been assigned
                        </li>
                        <li>
                           <strong>Under Review:</strong> Tasks with pull requests
                        </li>
                        <li>
                           <strong>Done:</strong> Completed tasks
                        </li>
                     </ul>
                  </div>
               </div>
            </section>

            {/* 3. note on branch tracking for activity timeline */}
            <section>
               <h2 className="mb-3 text-xl font-semibold">Activity Timeline (Branch Tracking)</h2>
               <div className="text-muted-foreground space-y-2 text-sm">
                  <p>
                     <strong>Important:</strong> For automatic task tracking, developers must follow the naming
                     convention
                     <code className="bg-muted rounded px-1 py-0.5 text-xs">{"<branch_name>_<task_number>"}</code> for
                     their branches, for example,{" "}
                     <code className="bg-muted rounded px-1 py-0.5 text-xs">feature/login_123</code> will be
                     automatically tracked by task number 123.
                  </p>
                  <p>
                     All commits, pull requests, and activity in these branches are tracked in the task&apos;s timeline.
                     When a pull request is created from a{" "}
                     <code className="bg-muted rounded px-1 py-0.5 text-xs">{"<branch_name>_<task_number>"}</code>{" "}
                     branch, the corresponding task automatically moves to &ldquo;Under Review&rdquo;.
                  </p>
                  <p>
                     Tasks only move to &ldquo;Done&rdquo; when their corresponding GitHub issues are closed, and not
                     necessarily when pull requests are merged.
                  </p>
                  <p>
                     All task movements happen automatically based on the above logic. Deleted tasks translate to
                     deleted GitHub issues.
                  </p>
               </div>
            </section>

            {/* 4. note on github api limits */}
            <section>
               <h2 className="mb-3 text-xl font-semibold">GitHub API Rate Limits</h2>
               <div className="text-muted-foreground space-y-2 text-sm">
                  <p>Task Bridge respects GitHub&apos;s API rate limits to ensure reliable operation:</p>
                  <ul className="ml-4 list-inside list-disc space-y-1">
                     <li>User searches are limited per minute</li>
                     <li>Project syncing has a minimum interval</li>
                     <li>If you encounter rate limit errors, wait a few moments before retrying</li>
                  </ul>
                  <p>The app automatically manages these limits and will notify you if you need to wait.</p>
                  <p>
                     {" "}
                     These rate limits apply to all GitHub API interactions, but should not impact your daily usage of
                     Task Bridge.
                  </p>
               </div>
            </section>

            {/* 5. note on upgrading versions */}
            <section>
               <h2 className="mb-3 text-xl font-semibold">Upgrading Versions</h2>
               <div className="text-muted-foreground space-y-2 text-sm">
                  <p>
                     <strong>Important:</strong> When upgrading to a newer version:
                  </p>
                  <ul className="ml-4 list-inside list-disc space-y-1">
                     <li>
                        Download the latest patched version from{" "}
                        <a
                           href={DOWNLOAD_URL}
                           className="text-PRIMARY underline"
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           {DOWNLOAD_URL_TEXT}
                        </a>
                     </li>
                     <li>
                        Always toggle <code className="bg-muted rounded px-1 py-0.5 text-xs">{"uninstall first"}</code>{" "}
                        option
                     </li>
                     <li>
                        Enable <code className="bg-muted rounded px-1 py-0.5 text-xs">{"clear previous data"}</code>{" "}
                        option. <strong>Important:</strong> This will delete all your local app settings, draft tasks,
                        and project names. All other data can be re-synchronized from GitHub within the app.
                     </li>
                  </ul>
                  <p>This process will be improved upon in future updates.</p>
                  <p>Older versions can be less stable, with more bugs, and should generally be avoided.</p>
               </div>
            </section>

            {/* 6. frequently asked questions */}
            <section>
               <h2 className="mb-3 text-xl font-semibold">Frequently Asked Questions</h2>
               <div className="text-muted-foreground space-y-4 text-sm">
                  <div>
                     <h3 className="text-foreground/80 mb-1 font-medium">1. Do I need to know how to use GitHub?</h3>
                     <p>
                        No! Task Bridge assumes little knowledge of GitHub. It handles all GitHub interactions behind
                        the scenes.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-foreground/80 mb-1 font-medium">2. Can I use existing GitHub repositories?</h3>
                     <p> Yes, you can sync existing GitHub repositories as projects in Task Bridge.</p>
                  </div>
                  <div>
                     <h3 className="text-foreground/80 mb-1 font-medium">3. What happens if I work offline?</h3>
                     <p>
                        Task Bridge requires an internet connection for most functionality as it syncs with GitHub in
                        real-time. You will be notified if you try to perform actions that require connectivity.
                     </p>
                  </div>
                  <div>
                     <h3 className="text-foreground/80 mb-1 font-medium">4. Can I manage multiple GitHub accounts?</h3>
                     <p>
                        Yes, Task Bridge supports switching between multiple GitHub accounts. At the moment this entails
                        clearing the current {"account's"} local app data and re-authenticating before switching. This
                        will be improved upon in future updates.
                     </p>
                  </div>
               </div>
            </section>

            {/* 7. note on more help, bug reports and feedback */}
            <section>
               <h2 className="mb-3 text-xl font-semibold">Support &amp; Feedback</h2>
               <div className="text-muted-foreground space-y-3 text-sm">
                  <p>Need more help or want to report issues? Here&apos;s how to get support:</p>
                  <div className="space-y-2">
                     <div>
                        <strong>GitHub Repository:</strong>{" "}
                        <a
                           href={GITHUB_REPO_URL}
                           className="text-PRIMARY underline"
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           {GITHUB_REPO_URL.replace("https://", "")}
                        </a>
                     </div>
                     <div>
                        <strong>Report Bugs:</strong>{" "}
                        <a
                           href={GITHUB_REPO_URL + "/issues"}
                           className="text-PRIMARY underline"
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           Create an issue on GitHub
                        </a>
                     </div>
                     <div>
                        <strong>Version:</strong> V{appVersion}
                     </div>
                  </div>
               </div>
            </section>
         </div>
      </div>
   );
}

# workflow

As seen from the eyes of 'a non-technical software-development-project manager', the target user of this product.
Not necessarilly a high level overview of what the manager sees.

_pre-requisites_ - a working personal/organization github account

1. Manager installs and starts up app.
2. App asks manager to authorize the app with their GitHub account.
3. Auth takes place, redirects to app's home-screen.
4. Manager selects 'create new project'.
5. App prompts for project-name, repo-name, and repo-visibility.
6. App also prompts for project team's usernames to invite as repo collaborators (must be on GitHub).
7. App creates repo on github, invites collaborators, with default access permissions.
8. Project dashboard opens up.
9. Dashboard has sections: backlog, in-progress, under-review, and done.
10.   Manager can create tasks and draft-tasks in the backlog section, specifying title, description, priority, and assignees.
11.   All drafts remain in backlog section and do not sync to GitHub.
12.   Tasks (with assignees) can also be put in backlog section through the 'add to backlog' feature, but sync to GitHub.
13.   Only tasks/drafts with assignees can move to 'in-progress', becoming assigned tasks, through the 'assign now' feature.
14.   Upon creation of a task (not draft), a corresponding github issue, is automatically created.
15.   Tasks will only be auto-tracked if a branch published to github follows the naming convention `task/<task-number>`.
16.   When a developer creates a pull request for branch `task/<task-number>`, to any branch, corresponding task moves to "under review".
17.   Task does not move to done if PR in corresponding branch `task/<task-number>` is merged.
18.   Task will only move to done if PR, for even branches that are not `task/<task-number>`, but with GitHub buzzword (fixes, resolves, etc) are merged, since GitHub itself auto-closes the issue.
19.   Task also moves to done upon manual closing on GitHub.
20.   Everything that happens in/to the corresponding branch `task/<task-number>`, is recorded in the task's timeline.
21.   Tasks will move between columns based only on the automation rules specified above.
22.   Tasks cannot move between columns otherwise, but can be edited or deleted in place.
23.   App syncs the active project dashboard with GitHub on navigation-to-it, and on a configurable interval (and eventually on webhook events).
24.   App produces notifications of github activity (powered by webhook events).
25.   Manager can sync existing github repositories as 'existing projects'.
26.   Each project has settings for dismissing/inviting team members, changing their permissions, changing repo visibility,changing repo/project name, and deleting project.
27.   App produces analytics on: task completion rates, average times spent in each column, and individual team member stats.
28.   As a positive consequence of how GitHub works, email notifications alert team members and manager of all repo activity originating from within/outside Task Bridge.
29.   App limtis most functionality to online-use only.
30.   App will allow adding/removing/switching of accounts

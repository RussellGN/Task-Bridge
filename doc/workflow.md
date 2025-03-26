# workflow

1. user starts up app for first time
2. app asks user to authenticate the app on their behalf
3. auth takes place, redirects to home screen
4. user selects 'create new project'
5. app prompts for name, and confirms repo name to be created
6. app prompts for developer github emails to add to project
7. app creates repo on github, gives added developers read, write access, but no admin access
8. new project dashboard opens up;
9. dashbaord has sections: backlog, ready/assigned, in-progress, awaiting-review, complete,
10.   user can create tasks in the backlog section, specifying title, description, priority, and assignees.
11.   tasks can be dragged and dropped between sections as their status changes
12.   each task is linked to a corresponding github issue, automatically created when the task is moved to ready.
13.   moving a task to "in-progress" automatically creates a new branch on github following a `{project-name}/{task-title}` naming convention.
14.   when a developer creates a pull request (pr) against the main branch, corresponding task moves to "awaiting review".
15.   the app fetches pr statuses and updates task statuses accordingly (e.g., merged prs move to "complete").
16.   users can comment on tasks, and comments sync with the corresponding github issue discussion.
17.   the app shows github activity logs, including commits, prs, and issue updates, inside the project dashboard.
18.   users can link existing github repositories instead of creating a new one.
19.   project settings allow managing team members, updating repo settings, and configuring task automation rules.
20.   the app provides analytics, such as task completion rates, pr merge times, and contributor activity.
21.   notifications alert users of pr reviews, merges, new tasks, or assignments.
22.   users can archive completed projects or delete them along with their github repositories.
23.   the app ensures offline functionality, allowing task updates that sync with github when online.

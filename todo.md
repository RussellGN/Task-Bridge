# v0.3

1. sync all projects on startup
2. handle pull requests that auto become tasks in done section
3. only show commits that were created in branch, not previously merged from elsewhere
4. When a developer creates a pull request for branch `task/<task-number>`, to any branch, corresponding task moves to "under review".
5. Task does not move to done if PR in corresponding branch `task/<task-number>` is merged.

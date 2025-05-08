# v0.3

1. implement assign draft now
2. Tasks will only be auto-tracked if a branch published to github follows the naming convention `task/<task-number>`.
3. When a developer creates a pull request for branch `task/<task-number>`, to any branch, corresponding task moves to "under review".
4. Task does not move to done if PR in corresponding branch `task/<task-number>` is merged.
5. Task will only move to done if PR, for even branches that are not `task/<task-number>`, but with GitHub buzzword (fixes, resolves, etc) are merged, since GitHub itself auto-closes the issue.
6. Task also moves to done upon manual closing on GitHub.
7. Everything that happens in/to the corresponding branch `task/<task-number>`, is recorded in the task's timeline.
8. Tasks will move between columns based only on the automation rules specified above.
9. Tasks cannot move between columns otherwise, but can be edited or deleted in place.

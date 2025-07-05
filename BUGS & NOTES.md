## BUGS

## NOTES

1. use ts.rs to auto generate ts types
2. strengthen API usage tracking and implement effective rate limiting
3. eventually remove app sync intervals, replace with webhooks
4. append task-bridge identifier to GitHub items created by app (e.g as issue labels)
5. alerts and error messages are not exactly friendly..too technical and vague
6. more debug logs/tracing needed, especially in backend
7. need to go through rust code, and refactor, clean alot of repeated and inefficient code
8. determine board for each task in backend, create root field 'state' in Task: chich is either: backlog, in-progress etc...
9. decompose rust modules further
10.   migrate to GitHub graphql API
11.   Allow multiple assignees for each task.

## BUGS

## NOTES

1. default to first tab in settings
2. use git tag message for release body in release workflow
3. use ts.rs to auto generate ts types
4. strengthen API usage tracking and implement effective rate limiting
5. eventually remove app sync intervals, replace with webhooks
6. append task-bridge identifier to GitHub items created by app (e.g as issue labels)
7. alerts and error messages are not exactly friendly..too technical and vague
8. more debug logs/tracing needed, especially in backend
9. need to go through rust code, and refactor, clean alot of repeated and inefficient code
10.   determine board for each task in backend, create root field 'state' in Task: chich is either: backlog, in-progress etc...
11.   find ways to to auto generate TS types and interfaces from rust types
12.   decompose rust modules further

## BUGS

## NOTES

1. use git tag message for release body in release workflow
2. use ts.rs to auto generate ts types
3. strengthen API usage tracking and implement effective rate limiting
4. eventually remove app sync intervals, replace with webhooks
5. append task-bridge identifier to GitHub items created by app (e.g as issue labels)
6. alerts and error messages are not exactly friendly..too technical and vague
7. more debug logs/tracing needed, especially in backend
8. need to go through rust code, and refactor, clean alot of repeated and inefficient code
9. determine board for each task in backend, create root field 'state' in Task: chich is either: backlog, in-progress etc...
10.   find ways to to auto generate TS types and interfaces from rust types
11.   decompose rust modules further

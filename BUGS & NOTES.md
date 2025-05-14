## BUGS

## NOTES

1. strengthen API usage tracking and implement effective rate limiting
2. eventually remove app sync intervals, replace with webhooks
3. append task-bridge identifier to GitHub items created by app (e.g as issue labels)
4. alerts and error messages are not exactly friendly..too technical and vague
5. more debug logs/tracing needed, especially in backend
6. need to go through rust code, and refactor, clean alot of repeated and inefficient code
7. determine board for each task in backend, create root field 'state' in Task: chich is either: backlog, in-progress etc...
8. find ways to to auto generate TS types and interfaces from rust types

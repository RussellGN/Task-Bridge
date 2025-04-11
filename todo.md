# v0.2

1. project dashbaord to have kanban board with sections: backlog, ready/assigned, in-progress, awaiting-review, complete,
2. sections to feature task cards which can move bi-directionly between sections via drag-and-drop or programmatically
3. task cards to be created in the backlog section, specifying title, description, priority, and assignees.
4. task can only move to 'ready' section if it has at least one developer assigned to it
5. upon moving to 'ready' section, github issue is auto created with email notification sent to assignees (auto done by github)
6. for now: app auto-fetches (at set intervals, or when manually requested) commits, PRs, and branch activity to update dashboard accordingly. (will use webhooks in future)

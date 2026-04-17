# Verification Guide - Epic & Story Hierarchy

This guide provides step-by-step instructions to verify the Jira-style hierarchy and automation implemented for Epics and Stories.

## 1. Hierarchy & Constraint Testing

### 1.1 Epics are Root-Level
- **Test**: Try to create a task with `type: "EPIC"` and a `parentTaskId`.
- **Expected Result**: Should return a `400 Validation Error` (Hierarchy Violation).
- **Test**: Try to move an existing EPIC under a parent.
- **Expected Result**: Should FAIL with hierarchy violation.

### 1.2 Epics are Sprint-Less
- **Test**: Try to create an EPIC with a `sprintId`.
- **Expected Result**: Should return a `400 Validation Error` (Epics span multiple sprints).

### 1.3 Subtask (Definition of Done)
- **Test**: Create a STORY with 2 Subtasks (Tasks with `parentTaskId`).
- **Test**: Try to mark the STORY as `DONE` while subtasks are `TODO`.
- **Expected Result**: Should FAIL with "Cannot mark STORY as DONE: unfinished subtasks".
- **Test**: Mark both subtasks as `DONE`, then mark Story as `DONE`.
- **Expected Result**: Should SUCCESS.

---

## 2. Automation Testing

### 2.1 Auto-Epic Completion
1. Create an **EPIC**.
2. Create two **STORIES** linked to that EPIC (`epicId`).
3. Set both stories to `TODO`.
4. Mark the first Story as `DONE`. (Epic should still be TODO).
5. Mark the second Story as `DONE`.
6. **Verify**: Check the EPIC's status. It should have automatically transitioned to `DONE`.

---

## 3. Analytics & Filtering Testing

### 3.1 Epic Analytics Endpoint
- **Endpoint**: `GET /projects/:projectId/epic-analytics`
- **Verify**: It should return a list of all Epics in the project with their `progress` percentage (0-100%).

### 3.2 Filtering by Epic
- **Endpoint**: `GET /projects/:projectId/tasks?epicId=:epicId`
- **Verify**: It should return only the stories/tasks associated with that specific Epic.

---

## 4. Sprint Integrity
- **Test**: Try to complete a SPRINT while it contains unfinished Stories/Tasks.
- **Expected Result**: Should FAIL with "Cannot complete sprint: X task(s) are unfinished".
- **Note**: Completion check now correctly ignores Epics (since they aren't meant to be in sprints).

---

## Verification Commands (CURL)

### Get Epic Analytics
```bash
curl -X GET "http://localhost:5000/api/projects/{{PROJECT_ID}}/epic-analytics" \
     -H "Authorization: Bearer {{TOKEN}}"
```

### Filter Stories by Epic
```bash
curl -X GET "http://localhost:5000/api/projects/{{PROJECT_ID}}/tasks?epicId={{EPIC_ID}}" \
     -H "Authorization: Bearer {{TOKEN}}"
```

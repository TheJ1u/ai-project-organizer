# OmniAI Codex sync

Installed worker: `C:\Users\jordy\Projects\ai-project-organizer\scripts\codex-sync-omniai.js`.

Runs daily at 7:00 AM in the Windows local time zone (currently Mountain). Windows denied S4U registration, so the installed task uses Jordan's interactive session: **Jordan must be signed in**. StartWhenAvailable allows a missed run when available; this task does not power on the computer. No password is stored.

## Run and maintain

```powershell
node C:\Users\jordy\Projects\ai-project-organizer\scripts\codex-sync-omniai.js --dry-run
node C:\Users\jordy\Projects\ai-project-organizer\scripts\codex-sync-omniai.js
& C:\Users\jordy\Projects\ai-project-organizer\scripts\install-codex-sync-task.ps1
Get-ScheduledTaskInfo -TaskName 'OmniAI-Codex-Sync'
Disable-ScheduledTask -TaskName 'OmniAI-Codex-Sync'
```

The installer contains the complete New-ScheduledTaskAction, daily trigger, and Register-ScheduledTask commands. Node.js is resolved to its absolute installed path. To remove the schedule, use `Unregister-ScheduledTask -TaskName 'OmniAI-Codex-Sync' -Confirm:$false`.

## Recommendation behavior

Recursively discovers Git repositories up to four folder levels under `C:\Users\jordy\Projects`; skips dependency folders, symlinks, and repository internals. Active means a commit or an existing changed/untracked file modified in the last 30 days. Uses the last five commits' filenames, current changed filenames, and the tracked/untracked file list. No file contents, credentials, or source code are sent externally.

These are **rule-based recommendations**, assigned to `chatgpt`; no model inference or paid API is invoked. API, onboarding/accessibility, setup documentation, and regression-test rules produce two or three tasks. Each includes file evidence, purpose, deliverables, and acceptance criteria. Review the suggested gap before implementing it.

Matches Hub projects by canonical local directory, with a name fallback only when the existing project has no directory. Registers undiscovered projects. Skips completed, archived, paused, and on-hold projects. A stable marker and title check avoid repeat recommendations, including completed ones. It does not reset task status or produce three fresh tasks every day after the categories have already been covered. New repositories and newly applicable categories can produce new tasks.

## Persistence and failure behavior

Uses the local projects/tasks APIs first. Only a refused connection permits direct-file fallback; HTTP errors, access failures, timeouts, or uncertain POST outcomes fail the run rather than risking a second write. A subsequent run reconciles saved records. Reads the saved DB back to verify persistence.

Offline mode validates existing JSON and IDs, preserves unrelated fields/records, uses unique task IDs, takes a timestamped backup, checks for intervening file edits, and atomically replaces the DB with a flushed temporary file. Never initializes a missing or malformed database. The worker lock prevents two Codex worker instances from overlapping; stale locks require inspection before manual removal.

**Concurrency limitation:** the existing Hub and other AI workers do not honor this lock. The final check and atomic replacement reduce risk but cannot guarantee isolation from another writer at the exact same instant. Avoid overlapping offline writers; full multi-writer guarantees require a shared transaction store or changes to every writer. Backup files are retained for manual recovery and are not deleted automatically.

Last successful run: `data\codex-sync-last-run.json`. For failures, inspect Task Scheduler's LastTaskResult (zero means success), then run the command manually to see the error. Worker tests: `node --test scripts/test-codex-sync-omniai.js`.

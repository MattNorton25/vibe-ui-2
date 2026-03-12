#!/bin/bash

# Claude Code Hook: Task Complete
# This script is called when Claude completes a task
# Usage: ./task-complete.sh "task description" [session_id] [task_id]

TASK_DESCRIPTION="$1"
SESSION_ID="${2:-claude-session}"
TASK_ID="${3:-task-1}"
VIBE_SERVER="${VIBE_SERVER:-http://localhost:3003}"

echo "✅ Completing task: $TASK_DESCRIPTION"

# Complete the task
curl -X POST "$VIBE_SERVER/api/pattern/task-complete" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"taskId\": \"$TASK_ID\",
    \"description\": \"✅ $TASK_DESCRIPTION\"
  }" \
  --silent --show-error

# Update work status to complete briefly
curl -X POST "$VIBE_SERVER/api/agent-status" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"complete\",
    \"context\": \"Completed: $TASK_DESCRIPTION\"
  }" \
  --silent --show-error

echo "🎉 Task completed in vibe UI!"
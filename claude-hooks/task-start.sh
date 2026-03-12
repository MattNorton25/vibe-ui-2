#!/bin/bash

# Claude Code Hook: Task Start
# This script is called when Claude starts working on a task
# Usage: ./task-start.sh "task description" [pattern_type] [task_count]

TASK_DESCRIPTION="$1"
PATTERN_TYPE="${2:-constellation}"
TASK_COUNT="${3:-5}"
VIBE_SERVER="${VIBE_SERVER:-http://localhost:3003}"

# Create a session ID based on timestamp
SESSION_ID="claude-$(date +%s)"

echo "🚀 Starting vibe session: $PATTERN_TYPE pattern with $TASK_COUNT tasks"
echo "📝 Description: $TASK_DESCRIPTION"

# Start pattern session
curl -X POST "$VIBE_SERVER/api/pattern/start" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"$PATTERN_TYPE\",
    \"taskCount\": $TASK_COUNT,
    \"description\": \"$TASK_DESCRIPTION\"
  }" \
  --silent --show-error

# Set work status to thinking
curl -X POST "$VIBE_SERVER/api/agent-status" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"thinking\",
    \"context\": \"$TASK_DESCRIPTION\"
  }" \
  --silent --show-error

echo "✅ Vibe session started!"
#!/bin/bash

# Claude Code Hook: Work Status Update
# This script updates the work status in the vibe UI
# Usage: ./work-status.sh "status" "context"

STATUS="$1"
CONTEXT="$2"
VIBE_SERVER="${VIBE_SERVER:-http://localhost:3003}"

echo "🔄 Updating work status: $STATUS"
if [ -n "$CONTEXT" ]; then
  echo "📝 Context: $CONTEXT"
fi

# Update work status
curl -X POST "$VIBE_SERVER/api/agent-status" \
  -H "Content-Type: application/json" \
  -d "{
    \"status\": \"$STATUS\",
    \"context\": \"$CONTEXT\"
  }" \
  --silent --show-error

echo "✅ Status updated!"
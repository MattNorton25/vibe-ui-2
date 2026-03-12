#!/bin/bash

# Demo Claude Code Integration
# This script demonstrates how the hooks work with your Vibe UI

echo "🎬 Starting Vibe UI Integration Demo..."
echo "Make sure your Vibe UI is running in Live Mode!"
echo ""

# Start a session
echo "1. Starting a new coding session..."
./claude-hooks/task-start.sh "Implementing new feature" mandala 6
sleep 3

# Show thinking
echo "2. Analyzing requirements..."
./claude-hooks/work-status.sh "thinking" "Analyzing code structure"
sleep 2

# Show working
echo "3. Working on implementation..."
./claude-hooks/work-status.sh "working" "Writing core logic"
sleep 2

# Complete first task
echo "4. Completed file analysis!"
./claude-hooks/task-complete.sh "Analyzed existing code structure"
sleep 2

# Complete second task  
echo "5. Implemented core function!"
./claude-hooks/task-complete.sh "Created main function"
sleep 2

# Show more thinking
echo "6. Planning tests..."
./claude-hooks/work-status.sh "thinking" "Designing test strategy"
sleep 2

# Complete third task
echo "7. Tests written!"
./claude-hooks/task-complete.sh "Wrote unit tests"
sleep 2

# Complete fourth task
echo "8. Documentation added!"
./claude-hooks/task-complete.sh "Added comprehensive docs"
sleep 2

# Final work
echo "9. Final optimizations..."
./claude-hooks/work-status.sh "working" "Performance optimization"
sleep 2

# Complete remaining tasks
echo "10. Code review complete!"
./claude-hooks/task-complete.sh "Completed code review"
sleep 1

echo "11. Feature finalized!"
./claude-hooks/task-complete.sh "Feature ready for deployment"
sleep 1

# Final status
echo "12. All done!"
./claude-hooks/work-status.sh "complete" "Feature implementation complete! 🎉"

echo ""
echo "🎉 Demo completed! Check your Vibe UI for the beautiful mandala pattern!"
# Claude Code Integration Hooks

These scripts integrate your Vibe UI with Claude Code activities.

## Setup Instructions

1. **Make scripts executable:**
   ```bash
   chmod +x claude-hooks/*.sh
   ```

2. **Start your Vibe UI server:**
   ```bash
   npm run dev  # Start React app on :3000
   # In another terminal:
   cd server && node index.js  # Start WebSocket server on :3002
   ```

3. **Configure Claude Code hooks** (add to your Claude Code settings):
   ```json
   {
     "hooks": {
       "tool_call_start": "path/to/vibe-ui-2/claude-hooks/work-status.sh working 'Using {{tool_name}}'",
       "tool_call_end": "path/to/vibe-ui-2/claude-hooks/task-complete.sh 'Completed {{tool_name}}'",
       "file_edit": "path/to/vibe-ui-2/claude-hooks/task-complete.sh 'Edited {{file_path}}'",
       "session_start": "path/to/vibe-ui-2/claude-hooks/task-start.sh 'Claude Code Session' mandala 8"
     }
   }
   ```

## Hook Scripts

### `task-start.sh`
Starts a new pattern session when Claude begins work.
```bash
./task-start.sh "Feature development" mandala 8
```

### `task-complete.sh` 
Completes a task when Claude finishes an operation.
```bash
./task-complete.sh "File edited successfully"
```

### `work-status.sh`
Updates the current work status.
```bash
./work-status.sh "working" "Analyzing code structure"
```

## Testing the Integration

1. **Manual test:**
   ```bash
   # Start a session
   ./claude-hooks/task-start.sh "Testing integration" crystal 5
   
   # Complete some tasks
   ./claude-hooks/task-complete.sh "Task 1 done"
   ./claude-hooks/task-complete.sh "Task 2 done"
   
   # Update status
   ./claude-hooks/work-status.sh "complete" "All done!"
   ```

2. **Set your Vibe UI to Live Mode** - it will show the real-time updates!

## Environment Variables

- `VIBE_SERVER` - Server URL (default: http://localhost:3002)

## Pattern Types Available

- `constellation` 🌟 - Circular star formation (good for debugging)
- `mandala` 🌸 - Radiating rings (good for feature development)
- `circuit` ⚡ - Electronic pathways (good for system optimization) 
- `crystal` 💎 - Hexagonal structure (good for architecture work)
- `spiral` 🌀 - Galaxy formation (good for iterative development)
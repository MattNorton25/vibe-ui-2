# Claude Pulse

A real-time ambient display that visualizes what Claude Code is doing — particle animations that shift state as your AI agent thinks, works, delegates, and completes tasks.

![States: OFF → IDLE → RECEIVING → THINKING → WORKING → PLANNING → DELEGATING → COMPLETE](https://img.shields.io/badge/states-8-blueviolet) ![Node.js](https://img.shields.io/badge/node-%3E%3D18-green) ![License: MIT](https://img.shields.io/badge/license-MIT-blue)

---

## What it looks like

Each Claude Code state maps to a distinct particle behavior:

| State | Visual |
|-------|--------|
| **OFF** | Dim, slowly drifting particles |
| **IDLE** | Gentle blue orbit, breathing rhythm |
| **RECEIVING** | White flash, inward collapse wave |
| **THINKING** | Purple orbital swirl, connection lines |
| **WORKING** | Orange burst orbits, shake, staggered waves |
| **PLANNING** | Teal hex grid formation, connection lines |
| **DELEGATING** | Pink sub-orbs orbiting a central cluster |
| **COMPLETE** | Gold crystalline ring formation |

Transitions use spring physics, HSL color interpolation (no muddy midpoints), per-particle stagger, and asymmetric enter/exit timing. Multiple simultaneous Claude sessions are supported — the highest-activity state wins.

---

## Requirements

- Node.js 18+
- Claude Code with hooks configured (see below)

---

## Installation

### Global install (recommended)

```bash
npm install -g @mattnorton/claude-pulse
claude-pulse
```

### One-time run with npx

```bash
npx @mattnorton/claude-pulse
```

### From source

```bash
git clone https://github.com/MattNorton25/vibe-ui-2.git claude-pulse
cd claude-pulse
npm install
npm start
```

Open **http://localhost:7888** in a browser.

---

## Connecting Claude Code

Claude Pulse receives events via HTTP hooks from Claude Code. Add this to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "SessionStart":     [{ "type": "command", "command": "curl -s -X POST http://localhost:7888/hook -H 'Content-Type: application/json' -d '{\"hook_event_name\":\"SessionStart\",\"session_id\":\"$SESSION_ID\"}'" }],
    "UserPromptSubmit": [{ "type": "command", "command": "curl -s -X POST http://localhost:7888/hook -H 'Content-Type: application/json' -d '{\"hook_event_name\":\"UserPromptSubmit\",\"session_id\":\"$SESSION_ID\"}'" }],
    "PreToolUse":       [{ "type": "command", "command": "curl -s -X POST http://localhost:7888/hook -H 'Content-Type: application/json' -d '{\"hook_event_name\":\"PreToolUse\",\"tool_name\":\"$TOOL_NAME\",\"tool_input\":\"$TOOL_INPUT_JSON\",\"session_id\":\"$SESSION_ID\"}'" }],
    "PostToolUse":      [{ "type": "command", "command": "curl -s -X POST http://localhost:7888/hook -H 'Content-Type: application/json' -d '{\"hook_event_name\":\"PostToolUse\",\"tool_name\":\"$TOOL_NAME\",\"session_id\":\"$SESSION_ID\"}'" }],
    "Stop":             [{ "type": "command", "command": "curl -s -X POST http://localhost:7888/hook -H 'Content-Type: application/json' -d '{\"hook_event_name\":\"Stop\",\"session_id\":\"$SESSION_ID\"}'" }],
    "SessionEnd":       [{ "type": "command", "command": "curl -s -X POST http://localhost:7888/hook -H 'Content-Type: application/json' -d '{\"hook_event_name\":\"SessionEnd\",\"session_id\":\"$SESSION_ID\"}'" }]
  }
}
```

Once configured, start a Claude Code session and the dashboard updates live.

---

## Multi-session support

Run as many Claude Code instances as you want — each tracks independently. The dashboard shows:

- The **dominant state** (highest-activity session wins: DELEGATING > WORKING > PLANNING > THINKING > RECEIVING > COMPLETE > IDLE > OFF)
- A **session count** indicator (top-left) when more than one session is active
- A **combined tool label** showing what each active session is doing

Sessions auto-expire after 5 minutes of inactivity.

---

## Manual testing

No Claude Code? Test states directly with curl:

```bash
# Cycle through all states
curl -s -X POST localhost:7888/hook -H "Content-Type: application/json" \
  -d '{"hook_event_name":"SessionStart"}'

curl -s -X POST localhost:7888/hook -H "Content-Type: application/json" \
  -d '{"hook_event_name":"UserPromptSubmit"}'

curl -s -X POST localhost:7888/hook -H "Content-Type: application/json" \
  -d '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":"{\"command\":\"ls\"}"}'

curl -s -X POST localhost:7888/hook -H "Content-Type: application/json" \
  -d '{"hook_event_name":"PreToolUse","tool_name":"Agent","tool_input":"{\"description\":\"explore\"}"}'

curl -s -X POST localhost:7888/hook -H "Content-Type: application/json" \
  -d '{"hook_event_name":"Stop"}'
```

Simulate two sessions:

```bash
curl -s -X POST localhost:7888/hook -H "Content-Type: application/json" \
  -d '{"hook_event_name":"SessionStart","session_id":"a"}'

curl -s -X POST localhost:7888/hook -H "Content-Type: application/json" \
  -d '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":"{\"command\":\"build\"}","session_id":"a"}'

curl -s -X POST localhost:7888/hook -H "Content-Type: application/json" \
  -d '{"hook_event_name":"SessionStart","session_id":"b"}'
```

---

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Dashboard UI |
| `/hook` | POST | Receive a Claude Code hook event |
| `/state` | GET | Current composite state (JSON) |
| `ws://localhost:7888` | WebSocket | Live state broadcast |

### Hook event payload

```json
{
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": "{\"command\": \"npm test\"}",
  "session_id": "optional-session-identifier"
}
```

---

## Accessibility

Respects `prefers-reduced-motion`: disables flash, shake, bursts, ripples, canvas blur, reduces particle count by 50%, and switches spring physics to direct lerp.

---

## Project structure

```
claude-pulse/
├── bin/
│   └── claude-pulse.js  # CLI entrypoint (npm global / npx)
├── public/
│   └── index.html       # Canvas renderer, particle system, overlay UI
├── server.js            # Express + WebSocket server, state machine, session manager
└── package.json
```

---

## License

MIT

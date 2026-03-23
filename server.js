const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");

const PORT = 7888;

// --- State Machine ---

const STATES = [
  "OFF",
  "IDLE",
  "RECEIVING",
  "THINKING",
  "WORKING",
  "PLANNING",
  "DELEGATING",
  "COMPLETE",
];

class StateMachine {
  constructor(broadcast) {
    this.broadcast = broadcast;
    this.state = "OFF";
    this.prevState = "OFF";
    this.tool = null;
    this.toolSummary = null;
    this.agent = null;
    this.prompt = null;
    this.session_id = null;
    this.timestamp = Date.now();
    this.history = [];
    this.pendingTimer = null;
  }

  transition(newState, metadata = {}) {
    this.cancelPending();
    this.prevState = this.state;
    this.state = newState;
    this.timestamp = Date.now();

    if (metadata.tool) this.tool = metadata.tool;
    if (metadata.toolSummary !== undefined) this.toolSummary = metadata.toolSummary;
    if (metadata.agent) this.agent = metadata.agent;
    if (metadata.prompt) this.prompt = metadata.prompt;
    if (metadata.session_id) this.session_id = metadata.session_id;

    this.history.push({
      state: newState,
      timestamp: this.timestamp,
      tool: this.tool,
    });
    if (this.history.length > 50) this.history.shift();

    this.broadcast(this.snapshot());
    this.scheduleAutoTransition();
  }

  scheduleAutoTransition() {
    if (this.state === "RECEIVING") {
      this.pendingTimer = setTimeout(() => {
        this.transition("THINKING");
      }, 800);
    } else if (this.state === "COMPLETE") {
      this.pendingTimer = setTimeout(() => {
        this.transition("IDLE");
      }, 4000);
    }
  }

  cancelPending() {
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }

  snapshot() {
    return {
      state: this.state,
      prevState: this.prevState,
      tool: this.tool,
      toolSummary: this.toolSummary,
      agent: this.agent,
      prompt: this.prompt,
      session_id: this.session_id,
      timestamp: this.timestamp,
      history: this.history.slice(-20),
    };
  }
}

// --- State priority (highest-activity wins) ---

const STATE_PRIORITY = {
  OFF: 0, IDLE: 1, COMPLETE: 2, RECEIVING: 3,
  THINKING: 4, PLANNING: 5, WORKING: 6, DELEGATING: 7,
};

const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// --- Session Manager ---

class SessionManager {
  constructor(broadcast) {
    this.sessions = new Map();     // session_id → StateMachine
    this.lastActivity = new Map(); // session_id → timestamp
    this.broadcast = broadcast;
    this.cleanupInterval = setInterval(() => this.cleanup(), 30000);
  }

  getOrCreate(sessionId) {
    if (!this.sessions.has(sessionId)) {
      const sm = new StateMachine(() => this.onSessionUpdate());
      this.sessions.set(sessionId, sm);
    }
    this.lastActivity.set(sessionId, Date.now());
    return this.sessions.get(sessionId);
  }

  onSessionUpdate() {
    this.broadcast(this.compositeSnapshot());
  }

  compositeSnapshot() {
    let dominantPriority = -1;
    let dominantSnap = null;
    const allHistory = [];
    const sessionTools = [];

    for (const [id, sm] of this.sessions) {
      const snap = sm.snapshot();
      const priority = STATE_PRIORITY[snap.state] || 0;

      if (priority > dominantPriority) {
        dominantPriority = priority;
        dominantSnap = snap;
      }

      if (snap.tool && snap.state !== "OFF" && snap.state !== "IDLE") {
        const summary = snap.toolSummary ? ` \u2014 ${snap.toolSummary}` : "";
        sessionTools.push(`${snap.tool}${summary}`);
      }

      for (const h of snap.history) {
        allHistory.push({ ...h, session_id: id });
      }
    }

    allHistory.sort((a, b) => a.timestamp - b.timestamp);
    const history = allHistory.slice(-20);

    const activeCount = [...this.sessions.values()]
      .filter((sm) => sm.state !== "OFF").length;

    return {
      state: dominantSnap?.state || "OFF",
      prevState: dominantSnap?.prevState || "OFF",
      tool: dominantSnap?.tool || null,
      toolSummary: dominantSnap?.toolSummary || null,
      agent: dominantSnap?.agent || null,
      prompt: dominantSnap?.prompt || null,
      session_id: dominantSnap?.session_id || null,
      timestamp: Date.now(),
      history,
      activeSessionCount: activeCount,
      sessionTools,
    };
  }

  removeSession(sessionId) {
    const sm = this.sessions.get(sessionId);
    if (sm) sm.cancelPending();
    this.sessions.delete(sessionId);
    this.lastActivity.delete(sessionId);
    this.broadcast(this.compositeSnapshot());
  }

  cleanup() {
    const now = Date.now();
    let changed = false;
    for (const [id, lastTime] of this.lastActivity) {
      if (now - lastTime > SESSION_TIMEOUT_MS) {
        const sm = this.sessions.get(id);
        if (sm) sm.cancelPending();
        this.sessions.delete(id);
        this.lastActivity.delete(id);
        changed = true;
      }
    }
    if (changed) this.broadcast(this.compositeSnapshot());
  }
}

// --- Summarize tool input ---

function summarize(toolName, toolInput) {
  if (!toolInput) return null;
  try {
    const input = typeof toolInput === "string" ? JSON.parse(toolInput) : toolInput;
    switch (toolName) {
      case "Bash":
        return input.command
          ? input.command.slice(0, 80)
          : null;
      case "Edit":
      case "Read":
      case "Write":
        return input.file_path
          ? input.file_path.replace(/.*[/\\]/, "")
          : null;
      case "Grep":
        return input.pattern
          ? `/${input.pattern}/`
          : null;
      case "Glob":
        return input.pattern || null;
      case "Agent":
        return input.description || input.prompt?.slice(0, 60) || null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

// --- Event → State mapping ---

function handleHookEvent(manager, body) {
  const event = body.hook_event_name;
  const toolName = body.tool_name || body.tool?.name;
  const toolInput = body.tool_input || body.tool?.input;
  const sessionId = body.session_id || "__default__";

  const sm = manager.getOrCreate(sessionId);
  const meta = { session_id: sessionId };

  switch (event) {
    case "SessionStart":
      sm.transition("IDLE", meta);
      break;

    case "UserPromptSubmit":
      meta.prompt = body.prompt || body.user_prompt;
      sm.transition("RECEIVING", meta);
      break;

    case "PreToolUse":
      if (toolName === "Agent") {
        meta.tool = toolName;
        meta.toolSummary = summarize(toolName, toolInput);
        sm.transition("PLANNING", meta);
      } else {
        meta.tool = toolName;
        meta.toolSummary = summarize(toolName, toolInput);
        sm.transition("WORKING", meta);
      }
      break;

    case "PostToolUse":
      meta.tool = toolName;
      meta.toolSummary = summarize(toolName, toolInput);
      sm.transition("THINKING", meta);
      break;

    case "SubagentStart":
      meta.agent = body.agent_name || body.subagent_id || "subagent";
      sm.transition("DELEGATING", meta);
      break;

    case "SubagentStop":
      sm.transition("THINKING", meta);
      break;

    case "Stop":
      sm.transition("COMPLETE", meta);
      break;

    case "SessionEnd":
      sm.transition("OFF", meta);
      // Remove session after brief delay so OFF state broadcasts first
      setTimeout(() => manager.removeSession(sessionId), 5000);
      break;

    default:
      // Unknown event — ignore
      break;
  }
}

// --- Server setup ---

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

const manager = new SessionManager(broadcast);

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify(manager.compositeSnapshot()));
  ws.on("close", () => clients.delete(ws));
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/hook", (req, res) => {
  try {
    handleHookEvent(manager, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error("Hook error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/state", (_req, res) => {
  res.json(manager.compositeSnapshot());
});

server.listen(PORT, () => {
  console.log(`Claude Pulse running on http://localhost:${PORT}`);
});

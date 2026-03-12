import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// WebSocket server with robust connection handling
const wss = new WebSocketServer({ 
  server,
  perMessageDeflate: false // Disable compression for real-time performance
});

// Session and connection management
const sessions = new Map();
const connections = new Map();

// Enhanced connection handling with error recovery
wss.on('connection', (ws, request) => {
  const connectionId = uuidv4();
  const clientInfo = {
    id: connectionId,
    ws,
    isAlive: true,
    connectedAt: Date.now(),
    lastActivity: Date.now()
  };
  
  connections.set(connectionId, clientInfo);
  
  console.log(`Client connected: ${connectionId} (${connections.size} total)`);

  // Heartbeat mechanism for connection health
  ws.on('pong', () => {
    clientInfo.isAlive = true;
    clientInfo.lastActivity = Date.now();
  });

  // Message handling with error recovery
  ws.on('message', (data) => {
    clientInfo.lastActivity = Date.now();
    
    try {
      const message = JSON.parse(data.toString());
      handleWebSocketMessage(ws, message, connectionId);
    } catch (error) {
      console.error('Invalid message format:', error);
      sendError(ws, 'Invalid message format');
    }
  });

  // Connection cleanup
  ws.on('close', () => {
    connections.delete(connectionId);
    console.log(`Client disconnected: ${connectionId} (${connections.size} remaining)`);
  });

  // Error handling
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${connectionId}:`, error);
    connections.delete(connectionId);
  });

  // Send welcome message
  sendMessage(ws, {
    type: 'connection_established',
    payload: { connectionId },
    timestamp: Date.now()
  });
});

// Robust message handling
function handleWebSocketMessage(ws, message, connectionId) {
  const { type, payload } = message;
  
  switch (type) {
    case 'pattern_start':
      handlePatternStart(ws, payload, connectionId);
      break;
      
    case 'task_progress':
      handleTaskProgress(ws, payload, connectionId);
      break;
      
    case 'task_complete':
      handleTaskComplete(ws, payload, connectionId);
      break;
      
    case 'status_update':
      handleStatusUpdate(ws, payload, connectionId);
      break;
      
    case 'ping':
      sendMessage(ws, { type: 'pong', timestamp: Date.now() });
      break;
      
    default:
      console.warn(`Unknown message type: ${type}`);
      sendError(ws, `Unknown message type: ${type}`);
  }
}

// Pattern session management
function handlePatternStart(ws, payload, connectionId) {
  const { type = 'constellation', taskCount = 5, description = 'New session' } = payload;
  
  if (taskCount < 1 || taskCount > 20) {
    sendError(ws, 'Task count must be between 1 and 20');
    return;
  }

  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    patternType: type,
    description,
    tasks: Array.from({ length: taskCount }, (_, i) => ({
      id: `task-${i + 1}`,
      description: `Task ${i + 1}`,
      progress: 0,
      completed: false,
      startedAt: null,
      completedAt: null
    })),
    startTime: Date.now(),
    status: 'active',
    connectionId
  };

  sessions.set(sessionId, session);
  
  sendMessage(ws, {
    type: 'pattern_started',
    payload: session,
    timestamp: Date.now()
  });

  // Broadcast to other connections
  broadcast({
    type: 'session_created',
    payload: { sessionId, description, taskCount },
    timestamp: Date.now()
  }, connectionId);

  console.log(`Pattern session started: ${sessionId} with ${taskCount} tasks`);
}

// Task progress tracking
function handleTaskProgress(ws, payload, connectionId) {
  const { sessionId, taskId, progress } = payload;
  
  const session = sessions.get(sessionId);
  if (!session) {
    sendError(ws, 'Session not found');
    return;
  }

  const task = session.tasks.find(t => t.id === taskId);
  if (!task) {
    sendError(ws, 'Task not found');
    return;
  }

  // Validate progress value
  const validProgress = Math.max(0, Math.min(1, parseFloat(progress)));
  task.progress = validProgress;
  
  if (!task.startedAt && validProgress > 0) {
    task.startedAt = Date.now();
  }

  sendMessage(ws, {
    type: 'task_updated',
    payload: { sessionId, taskId, progress: validProgress },
    timestamp: Date.now()
  });

  // Broadcast progress to other connections
  broadcast({
    type: 'task_progress_update',
    payload: { sessionId, taskId, progress: validProgress },
    timestamp: Date.now()
  }, connectionId);

  console.log(`Task progress: ${sessionId}/${taskId} -> ${Math.round(validProgress * 100)}%`);
}

// Task completion handling
function handleTaskComplete(ws, payload, connectionId) {
  const { sessionId, taskId, description } = payload;
  
  const session = sessions.get(sessionId);
  if (!session) {
    sendError(ws, 'Session not found');
    return;
  }

  const task = session.tasks.find(t => t.id === taskId);
  if (!task) {
    sendError(ws, 'Task not found');
    return;
  }

  // Mark task as completed
  task.completed = true;
  task.progress = 1.0;
  task.completedAt = Date.now();
  if (description) task.description = description;

  // Check if all tasks are completed
  const allCompleted = session.tasks.every(t => t.completed);
  if (allCompleted) {
    session.status = 'completed';
    session.completedAt = Date.now();
  }

  sendMessage(ws, {
    type: 'task_completed',
    payload: { sessionId, taskId, task, sessionComplete: allCompleted },
    timestamp: Date.now()
  });

  // Broadcast completion to other connections
  broadcast({
    type: 'task_completion_celebration',
    payload: { sessionId, taskId, description, sessionComplete: allCompleted },
    timestamp: Date.now()
  }, connectionId);

  console.log(`Task completed: ${sessionId}/${taskId}${allCompleted ? ' (SESSION COMPLETE)' : ''}`);
}

// Work status updates
function handleStatusUpdate(ws, payload, connectionId) {
  const { status, context, intensity = 0.5 } = payload;
  
  const validStatuses = ['idle', 'thinking', 'working', 'complete'];
  if (!validStatuses.includes(status)) {
    sendError(ws, 'Invalid status value');
    return;
  }

  const statusUpdate = {
    status,
    context: context || null,
    intensity: Math.max(0, Math.min(1, intensity)),
    timestamp: Date.now()
  };

  // Broadcast to all connections including sender
  broadcast({
    type: 'status_updated',
    payload: statusUpdate,
    timestamp: Date.now()
  });

  console.log(`Status update: ${status} (${context || 'no context'})`);
}

// Utility functions for robust communication
function sendMessage(ws, message) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws, errorMessage) {
  sendMessage(ws, {
    type: 'error',
    payload: { message: errorMessage },
    timestamp: Date.now()
  });
}

function broadcast(message, excludeConnectionId = null) {
  connections.forEach((clientInfo, connectionId) => {
    if (connectionId !== excludeConnectionId && clientInfo.ws.readyState === clientInfo.ws.OPEN) {
      sendMessage(clientInfo.ws, message);
    }
  });
}

// Connection health monitoring
setInterval(() => {
  const now = Date.now();
  connections.forEach((clientInfo, connectionId) => {
    if (!clientInfo.isAlive || (now - clientInfo.lastActivity) > 60000) {
      console.log(`Terminating inactive connection: ${connectionId}`);
      clientInfo.ws.terminate();
      connections.delete(connectionId);
    } else {
      clientInfo.isAlive = false;
      clientInfo.ws.ping();
    }
  });
}, 30000);

// REST API endpoints for HTTP integration
app.post('/api/pattern/start', (req, res) => {
  const { type = 'constellation', taskCount = 5, description = 'API Session' } = req.body;
  
  if (taskCount < 1 || taskCount > 20) {
    return res.status(400).json({ error: 'Task count must be between 1 and 20' });
  }

  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    patternType: type,
    description,
    tasks: Array.from({ length: taskCount }, (_, i) => ({
      id: `task-${i + 1}`,
      description: `Task ${i + 1}`,
      progress: 0,
      completed: false
    })),
    startTime: Date.now(),
    status: 'active'
  };

  sessions.set(sessionId, session);
  
  // Broadcast to WebSocket clients
  broadcast({
    type: 'pattern_started',
    payload: session,
    timestamp: Date.now()
  });

  res.json({ success: true, session });
});

app.post('/api/pattern/task-complete', (req, res) => {
  const { sessionId, taskId, description } = req.body;
  
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const task = session.tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.completed = true;
  task.progress = 1.0;
  if (description) task.description = description;

  const allCompleted = session.tasks.every(t => t.completed);
  if (allCompleted) {
    session.status = 'completed';
  }

  // Broadcast to WebSocket clients
  broadcast({
    type: 'task_completed',
    payload: { sessionId, taskId, task, sessionComplete: allCompleted },
    timestamp: Date.now()
  });

  res.json({ success: true, task, sessionComplete: allCompleted });
});

app.post('/api/agent-status', (req, res) => {
  const { status, context } = req.body;
  
  broadcast({
    type: 'status_updated',
    payload: { status, context, timestamp: Date.now() },
    timestamp: Date.now()
  });

  res.json({ success: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    connections: connections.size,
    sessions: sessions.size,
    uptime: process.uptime()
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Vibe UI Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`HTTP API: http://localhost:${PORT}/api`);
});
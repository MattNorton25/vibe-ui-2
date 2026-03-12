// Core types for the vibe-ui system
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX?: number;
  targetY?: number;
  color: string;
  size: number;
  alpha: number;
  magnetism: number; // 0-1, strength of attraction to target
}

export interface PatternPosition {
  x: number;
  y: number;
  index: number;
  completed: boolean;
}

export interface Task {
  id: string;
  description: string;
  progress: number; // 0-1
  completed: boolean;
  position?: PatternPosition;
}

export type PatternType = 'constellation' | 'mandala' | 'circuit' | 'crystal' | 'spiral';

export interface VibeSession {
  id: string;
  patternType: PatternType;
  tasks: Task[];
  startTime: number;
  status: 'active' | 'completed';
}

export interface WorkState {
  status: 'idle' | 'thinking' | 'working' | 'complete';
  context?: string;
  intensity: number; // 0-1
}

// WebSocket message types
export interface SocketMessage {
  type: 'task_start' | 'task_progress' | 'task_complete' | 'status_update';
  payload: any;
  timestamp: number;
}
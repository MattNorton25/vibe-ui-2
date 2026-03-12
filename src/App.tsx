import React, { useState, useEffect, useCallback } from 'react';
import { VisualizationCanvas } from './components/VisualizationCanvas';
import { socketService } from './services/socketService';
import { VibeSession, WorkState, PatternType } from './types';
import './App.css';

type AppMode = 'demo' | 'live';

export const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('demo');
  const [session, setSession] = useState<VibeSession | null>(null);
  const [workState, setWorkState] = useState<WorkState>({
    status: 'idle',
    intensity: 0.1
  });
  const [isConnected, setIsConnected] = useState(false);
  const [fps, setFps] = useState(0);
  
  // Demo mode state
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('constellation');
  const [taskCount, setTaskCount] = useState(6);

  // Initialize WebSocket connection
  useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    
    const handlePatternStarted = (payload: VibeSession) => {
      console.log('Pattern session started:', payload);
      setSession(payload);
    };

    const handleTaskCompleted = (payload: any) => {
      console.log('Task completed:', payload);
      setSession(prev => {
        if (!prev || prev.id !== payload.sessionId) return prev;
        
        const updatedTasks = prev.tasks.map(task => 
          task.id === payload.taskId ? { ...task, ...payload.task } : task
        );
        
        return { ...prev, tasks: updatedTasks };
      });
      
      // Brief celebration state
      if (payload.sessionComplete) {
        setWorkState({ status: 'complete', intensity: 1.0 });
        setTimeout(() => {
          setWorkState({ status: 'idle', intensity: 0.1 });
        }, 3000);
      }
    };

    const handleStatusUpdated = (payload: any) => {
      console.log('Status updated:', payload);
      setWorkState({
        status: payload.status,
        context: payload.context,
        intensity: payload.intensity || 0.5
      });
    };

    // Register event handlers
    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);
    socketService.on('pattern_started', handlePatternStarted);
    socketService.on('task_completed', handleTaskCompleted);
    socketService.on('status_updated', handleStatusUpdated);

    // Connect to server
    socketService.connect();

    return () => {
      socketService.off('connected', handleConnected);
      socketService.off('disconnected', handleDisconnected);
      socketService.off('pattern_started', handlePatternStarted);
      socketService.off('task_completed', handleTaskCompleted);
      socketService.off('status_updated', handleStatusUpdated);
    };
  }, []);

  // Demo functions for testing
  const startDemoSession = useCallback(() => {
    socketService.startPatternSession(selectedPattern, taskCount, `${selectedPattern} demo session`);
  }, [selectedPattern, taskCount]);

  const simulateTaskProgress = useCallback(() => {
    if (!session) return;
    
    const incompleteTasks = session.tasks.filter(t => !t.completed);
    if (incompleteTasks.length === 0) return;
    
    const task = incompleteTasks[0];
    socketService.completeTask(session.id, task.id, `✅ ${task.description} completed`);
  }, [session]);

  const updateStatus = useCallback((status: WorkState['status']) => {
    socketService.updateWorkStatus(status, `Switched to ${status} mode`);
  }, []);

  const handleFpsUpdate = useCallback((currentFps: number) => {
    setFps(currentFps);
  }, []);

  return (
    <div className="app">
      <div className="visualization-container">
        <VisualizationCanvas 
          session={session}
          workState={workState}
          onAnimationFrame={handleFpsUpdate}
        />
        
        {/* Status overlay */}
        <div className="status-overlay">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-indicator"></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          
          <div className="performance-info">
            <div>FPS: {fps}</div>
            {session && (
              <div>
                Session: {session.tasks.filter(t => t.completed).length}/{session.tasks.length} tasks
              </div>
            )}
          </div>
          
          <div className="work-state">
            <div className={`state-indicator ${workState.status}`}></div>
            <span className="state-text">{workState.status}</span>
            {workState.context && <span className="state-context">• {workState.context}</span>}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button 
            onClick={() => setMode('demo')}
            className={`mode-button ${mode === 'demo' ? 'active' : ''}`}
          >
            Demo Mode
          </button>
          <button 
            onClick={() => setMode('live')}
            className={`mode-button ${mode === 'live' ? 'active' : ''}`}
          >
            Live Mode
          </button>
        </div>

        {/* Demo Controls */}
        {mode === 'demo' && (
          <div className="demo-controls">
            <div className="pattern-controls">
              <label>Pattern Type:</label>
              <select 
                value={selectedPattern} 
                onChange={(e) => setSelectedPattern(e.target.value as PatternType)}
                className="pattern-selector"
              >
                <option value="constellation">🌟 Constellation</option>
                <option value="mandala">🌸 Mandala</option>
                <option value="circuit">⚡ Circuit</option>
                <option value="crystal">💎 Crystal</option>
                <option value="spiral">🌀 Spiral</option>
              </select>
              
              <label>Task Count:</label>
              <input 
                type="range" 
                min="3" 
                max="15" 
                value={taskCount}
                onChange={(e) => setTaskCount(parseInt(e.target.value))}
                className="task-count-slider"
              />
              <span className="task-count-display">{taskCount}</span>
            </div>
            
            <button 
              onClick={startDemoSession} 
              disabled={!isConnected}
              className="control-button primary"
            >
              Start {selectedPattern} Pattern
            </button>
            
            <button 
              onClick={simulateTaskProgress} 
              disabled={!session || session.tasks.every(t => t.completed)}
              className="control-button secondary"
            >
              Complete Next Task
            </button>
            
            <div className="status-controls">
              <label>Work State:</label>
              {(['idle', 'thinking', 'working'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={!isConnected}
                  className={`control-button status ${workState.status === status ? 'active' : ''}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Mode Controls */}
        {mode === 'live' && (
          <div className="live-controls">
            <div className="live-status">
              <h3>🔗 Claude Code Integration</h3>
              <p>{isConnected ? '✅ Connected to server' : '❌ Server disconnected'}</p>
              <p>Listening for Claude Code hooks...</p>
              {session && (
                <div className="current-session">
                  <strong>Active Session:</strong> {session.patternType} pattern
                  <br />
                  <strong>Progress:</strong> {session.tasks.filter(t => t.completed).length}/{session.tasks.length} tasks
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
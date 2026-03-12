# Vibe UI - Agent-Driven Ambient Interface

A revolutionary ambient UI that rhythmically "vibes" with your AI agents as they work, progressively building beautiful geometric patterns as tasks complete. Born from the idea of creating visual feedback that's entertaining but not distracting, celebrating actual productivity rather than just eye candy.

## 🌟 Core Vision

**The Problem**: AI agents work invisibly. You don't see their progress, effort, or completion. Work feels disconnected from visual satisfaction.

**The Solution**: A unified vibe-pattern system where particles flow and dance with work rhythm, gradually crystallizing into geometric patterns as real tasks complete. It's both mesmerizing to watch AND functionally represents actual productivity.

## 🎨 Architecture Overview

### Agent-Driven Design Pattern
Built using an **agent-based architecture** where specialized "agents" (code modules) handle different aspects:

- **VibeAgent** - Mood assessment, theme selection, atmospheric control
- **ActivityAgent** - Work state detection, pattern analysis, rhythm tracking  
- **TaskTrackerAgent** - Visual todo management, pattern session coordination
- **AgentOrchestrator** - Central coordination and event management

### Unified Vibe-Pattern Canvas
The revolutionary **VibePatternCanvas** seamlessly blends two experiences:

1. **Particle System** - Dynamic particles that respond to work rhythm
2. **Pattern Builder** - Geometric shapes that build as tasks complete

**Key Innovation**: Instead of separate modes, particles organically flow toward pattern positions, creating **streams of energy** that crystallize into geometric shapes upon task completion.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the complete system (server + UI)
npm run dev
```

This starts:
- **WebSocket server** on port 3002 (API + real-time events)
- **React app** on port 3000 (UI interface)

## 🎯 Pattern Types

### Mandala 🌸
- **Use case**: Complex feature development
- **Visual**: Radiating rings and petals from center
- **Behavior**: Each task adds a ring, creating sacred geometry
- **Best for**: 5-8 step implementations

### Constellation ⭐
- **Use case**: Debugging and problem-solving
- **Visual**: Stars connecting in circular formation
- **Behavior**: Sequential connections form recognizable patterns
- **Best for**: 3-6 step investigations

### Circuit ⚡
- **Use case**: System optimization and technical tasks
- **Visual**: Electronic pathways lighting up
- **Behavior**: Right-angle connections like circuit traces
- **Best for**: 6-10 optimization steps

### Crystal 💎
- **Use case**: Architectural and structural work
- **Visual**: Growing crystalline structures with branching facets
- **Behavior**: Hexagonal layers building outward
- **Best for**: Foundation and framework tasks

### Spiral 🌀
- **Use case**: Iterative development and creative projects
- **Visual**: Arms extending in galaxy formation
- **Behavior**: Continuous spiral growth
- **Best for**: Ongoing development with multiple iterations

## 🌊 Rhythmic Behavior System

### Multi-Layered Rhythm Engine
```javascript
// Core rhythm calculation
const basePulse = Math.sin(time * 2) * 0.5 + 0.5;      // 2Hz base rhythm
const rapidPulse = Math.sin(time * 6) * 0.3 + 0.7;     // 6Hz detail rhythm  
const slowWave = Math.sin(time * 0.5) * 0.2 + 0.8;     // 0.5Hz breathing
const rhythmPulse = basePulse * rapidPulse * slowWave;
```

### Work State Behaviors
- **Idle**: Gentle floating with subtle rhythm waves
- **Thinking**: Swirling motion with rhythmic acceleration
- **Working**: Strong energy pulses with directional rhythm waves  
- **Complete**: Explosive celebration with radial bursts

### Particle Magnetism System
Particles are dynamically assigned to tasks based on status:

- **Completed tasks**: Particles crystallize at pattern positions with glow effects
- **In-progress tasks**: Particles flow toward positions with strength based on progress
- **Pending tasks**: Weak magnetic attraction shows future structure
- **No session**: Particles roam freely, pure ambient vibe

## 📡 Real-Time Integration

### WebSocket API
Connect any external system to drive the visual experience:

```bash
# Start a pattern session
curl -X POST http://localhost:3002/api/pattern/start \
  -d '{"type": "mandala", "taskCount": 5, "description": "Feature development"}'

# Update task progress  
curl -X POST http://localhost:3002/api/pattern/task-progress \
  -d '{"sessionId": "session-1", "taskId": "task-1", "progress": 0.7}'

# Complete a task
curl -X POST http://localhost:3002/api/pattern/task-complete \
  -d '{"sessionId": "session-1", "taskId": "task-1", "description": "✅ Implemented core logic"}'
```

### Agent Status Updates
Update work rhythm and particle behavior:

```bash
# Change work state
curl -X POST http://localhost:3002/api/agent-status \
  -d '{"status": "working", "context": "Debugging complex issue"}'

# Update mood/context
curl -X POST http://localhost:3002/api/mood \
  -d '{"context": "High-pressure deadline", "mood": "focused"}'
```

## 🎭 Demo Examples

### Run Pattern Demonstrations
```bash
# Simulate different work patterns
node examples/pattern-demo.js mandala      # Feature development workflow
node examples/pattern-demo.js constellation # Debugging workflow  
node examples/pattern-demo.js circuit      # Optimization workflow
node examples/pattern-demo.js all          # All patterns in sequence
```

### Run Activity Simulations
```bash
# Simulate work sessions
node examples/test-integration.js coding    # Development session
node examples/test-integration.js creative  # Design session
node examples/test-integration.js debugging # Bug investigation
```

## 💡 Key Design Decisions

### Why Agent-Based Architecture?
- **Modularity**: Each agent has clear responsibilities and skills
- **Extensibility**: Easy to add new agents (AudioAgent, BiometricsAgent, etc.)
- **Testability**: Agents can be tested independently
- **Real-world modeling**: Mirrors how actual AI agent systems work

### Why Unified Canvas vs Separate Components?
**Problem**: Users wanted pattern building AND ambient particles, not either/or.

**Solution**: Particles that flow into patterns. Creates a continuous experience where:
- Ambient particles provide constant visual interest
- Pattern magnetism builds anticipation  
- Crystallization provides completion satisfaction
- Rhythm ties everything together

### Why Real-Time Pattern Building?
**Core insight**: The UI should reflect actual work progress, not just demos.

Traditional productivity tools show static progress bars. This system shows:
- **Living progress** - Particles flowing toward goals
- **Meaningful completion** - Beautiful geometric celebration
- **Work rhythm** - Visual feedback matching actual effort
- **Accomplishment persistence** - Completed patterns remain visible

## 🔮 Future Enhancements

### Planned Features
- **AudioAgent** - Ambient sound generation synchronized with visuals
- **BiometricsAgent** - Heart rate and stress level integration
- **TimeAgent** - Circadian rhythm awareness and adaptation
- **CollaborationAgent** - Multi-user pattern building
- **HistoryAgent** - Pattern gallery and productivity insights

### Integration Possibilities
- **VS Code Extension** - Real-time code analysis pattern building
- **Claude Code Integration** - Automatic pattern updates during AI sessions
- **Productivity Apps** - Todoist, Notion, Linear pattern synchronization
- **Development Tools** - CI/CD pipeline visualization
- **Communication** - Slack/Discord status integration

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18** - Component framework
- **TypeScript** - Type safety
- **Canvas API** - High-performance particle rendering
- **WebSocket Client** - Real-time server communication

### Backend Stack  
- **Node.js + Express** - API server
- **WebSocket (ws)** - Real-time communication
- **CORS enabled** - Cross-origin resource sharing

### File Structure
```
vibe-ui/
├── src/
│   ├── agents/           # Agent-based architecture
│   │   ├── BaseAgent.ts           # Core agent framework
│   │   ├── VibeAgent.ts          # Mood and theming
│   │   ├── ActivityAgent.ts      # Work state tracking
│   │   ├── TaskTrackerAgent.ts   # Pattern session management
│   │   └── AgentOrchestrator.ts  # Central coordination
│   ├── components/       # React components
│   │   ├── VibePatternCanvas.tsx # Unified particle-pattern system
│   │   ├── VibeWidget.tsx        # Main widget container
│   │   ├── ParticleSystem.tsx    # Legacy particle system
│   │   └── PatternBuilder.tsx    # Legacy pattern builder
│   ├── services/
│   │   └── WebSocketService.ts   # Real-time communication
│   └── App.tsx          # Main application
├── server/
│   └── index.js         # WebSocket server + API
├── examples/
│   ├── pattern-demo.js           # Pattern building demos
│   ├── test-integration.js      # Work session simulations
│   └── claude-integration.sh    # Shell integration helpers
└── README.md           # This documentation
```

## 🎨 Visual Philosophy

### Design Principles
1. **Entertaining, not distracting** - Visuals enhance focus rather than break it
2. **Meaningful representation** - Every visual element represents real work
3. **Progressive disclosure** - Complexity builds with accomplishment
4. **Rhythmic consistency** - Everything pulses and flows together
5. **Celebration of completion** - Finishing work feels genuinely rewarding

### Color Psychology
- **Primary colors** - Calm, professional base tones
- **Secondary colors** - Energy and activity indicators  
- **Accent colors** - Celebration and completion highlights
- **Dynamic theming** - Colors adapt to mood and context

### Animation Principles
- **Rhythm-driven** - All movement synchronized to work pulse
- **Physics-based** - Natural particle movement and magnetism
- **State-responsive** - Animations change with work intensity
- **Smooth transitions** - No jarring changes, only flowing evolution

## 📈 Usage Analytics Ideas

### Potential Metrics
- **Pattern completion rates** - Which patterns motivate best?
- **Work rhythm analysis** - Optimal productivity pulse frequencies
- **Session duration correlation** - Visual feedback impact on focus time
- **Mood-pattern associations** - Which patterns work for which contexts
- **Celebration effectiveness** - Does completion animation increase satisfaction?

## 🤝 Contributing

This is an experimental R&D project exploring the intersection of:
- AI agent visualization
- Ambient computing interfaces  
- Productivity gamification
- Real-time visual feedback systems

The codebase is designed for experimentation and extension. Key areas for contribution:

1. **New Agent Types** - Expand the agent ecosystem
2. **Pattern Variations** - Create new geometric pattern types
3. **Rhythm Enhancements** - More sophisticated timing systems
4. **Integration Adapters** - Connect to new external systems
5. **Performance Optimization** - Canvas rendering improvements

## 🎯 Success Metrics

This project succeeds if:
- **Work feels more engaging** - Visual feedback increases motivation
- **Completion feels rewarding** - Pattern building provides satisfaction  
- **Progress is visible** - Hidden work becomes tangible and celebrated
- **Rhythm enhances focus** - Visual pulse helps maintain productive flow
- **Real utility emerges** - People actually use it for real work

---

*Built with ❤️ as an exploration in making AI agent work visible, engaging, and beautiful.*
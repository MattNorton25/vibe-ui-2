# Vibe UI 2.0 🌊

> Transform your AI agent work into beautiful, rhythmic geometric patterns

A revolutionary ambient UI that visualizes AI productivity through flowing particles that crystallize into stunning patterns as tasks complete. Watch your Claude Code sessions become living art.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-orange)
![Status](https://img.shields.io/badge/Status-Ready%20to%20Use-brightgreen)

## ✨ Features

🎭 **Advanced Particle Physics** - Magnetism system with particles flowing toward pattern positions  
🌟 **5 Beautiful Patterns** - Constellation, Mandala, Circuit, Crystal, Spiral - each for different work types  
🔗 **Claude Code Integration** - Real-time hooks that respond to your actual coding activities  
🎮 **Demo + Live Modes** - Test patterns instantly or connect to real work  
⚡ **60fps Performance** - Smooth animations with intelligent performance optimization  
🌊 **Rhythm Engine** - Multi-layered timing system creates organic, breathing movement

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the React app
npm run dev

# In another terminal, start the WebSocket server
cd server && node index.js
```

Open http://localhost:3002 and switch between **Demo Mode** (test patterns) and **Live Mode** (Claude Code integration).

## 🎯 Pattern Types

| Pattern | Best For | Visual Style |
|---------|----------|--------------|
| 🌟 **Constellation** | Debugging & Investigation | Stars in circular formation |
| 🌸 **Mandala** | Feature Development | Radiating rings from center |
| ⚡ **Circuit** | System Optimization | Electronic grid pathways |
| 💎 **Crystal** | Architecture Work | Hexagonal crystalline structure |
| 🌀 **Spiral** | Iterative Development | Galaxy spiral formation |

## 🔗 Claude Code Integration

Ready-to-use hook scripts in `claude-hooks/`:

```bash
# Start a new session
./claude-hooks/task-start.sh "Implementing new feature" mandala 8

# Complete a task  
./claude-hooks/task-complete.sh "Successfully implemented core logic"

# Update work status
./claude-hooks/work-status.sh "working" "Debugging complex algorithm"

# Run full demo
./claude-hooks/demo-integration.sh
```

Add these to your Claude Code hooks configuration to see real-time patterns as you work!

## 📡 API Integration

Connect any external system via WebSocket or HTTP:

```bash
# Start a pattern session
curl -X POST http://localhost:3003/api/pattern/start \
  -H "Content-Type: application/json" \
  -d '{"type": "mandala", "taskCount": 5, "description": "Feature development"}'

# Complete a task
curl -X POST http://localhost:3003/api/pattern/task-complete \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "session-id", "taskId": "task-1", "description": "✅ Task done"}'
```

## 🛠️ Technical Architecture

**Frontend:** React 18 + TypeScript + Canvas API  
**Backend:** Node.js + Express + WebSocket  
**Physics:** Custom particle system with magnetism  
**Performance:** Object pooling, frame skipping, adaptive particle count

```
src/
├── components/
│   ├── ParticleSystem.ts      # Physics engine
│   ├── PatternGenerator.ts    # Pattern algorithms  
│   └── VisualizationCanvas.tsx # Main canvas
├── services/
│   └── socketService.ts       # WebSocket client
└── hooks/
    └── useAnimationFrame.ts   # 60fps rendering
```

## 🎨 How It Works

1. **Particle Magnetism** - Particles are assigned to pattern positions based on task status
2. **Rhythm Engine** - Multi-layer sine waves create organic breathing movement  
3. **Progressive Crystallization** - Completed tasks show crystallized particles with glow effects
4. **Real-time Sync** - WebSocket updates flow seamlessly into visual changes

## 🎭 Demo Mode Features

- **Pattern Selector** - Try all 5 pattern types with emoji labels
- **Task Count Slider** - Adjust complexity (3-15 tasks)
- **Work State Controls** - Test different rhythm behaviors
- **Real-time FPS Monitor** - Performance feedback

## 🔮 Future Possibilities

- **VS Code Extension** - Real-time code analysis visualization
- **Productivity App Integration** - Todoist, Notion, Linear connections  
- **Multi-user Sessions** - Collaborative pattern building
- **Audio Synchronization** - Sound generation matching visuals
- **Biometric Integration** - Heart rate and stress level visualization

## 🎯 Success Vision

This project succeeds when:
- ✅ Work feels more engaging through visual feedback
- ✅ Task completion provides genuine satisfaction  
- ✅ Hidden progress becomes tangible and celebrated
- ✅ The rhythm enhances rather than distracts from flow
- ✅ People use it for real work, not just demos

---

*Built with ❤️ to make AI agent work visible, engaging, and beautiful.*

**Ready to turn your productivity into art?** 🎨
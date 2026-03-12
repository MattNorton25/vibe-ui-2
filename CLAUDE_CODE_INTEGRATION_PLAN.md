# Vibe UI 2.0 - Claude Code Integration Plan
## Ambient Work Visualization for Claude Code Sessions

**Document Version**: 1.0  
**Created**: March 11, 2026  
**Status**: Ready for implementation  
**Integration Type**: Claude Code Skill + File Watcher  

---

## 🎯 **Integration Vision**

Transform every Claude Code session into a beautiful ambient visualization where:
- **Todo items become constellation stars** that light up as tasks complete
- **Work states change particle behavior** (idle → thinking → working → complete)
- **Session progress builds geometric patterns** that celebrate actual productivity
- **Real-time visual feedback** makes AI agent work tangible and rewarding

---

## 📋 **Integration Strategy**

### **Phase 1: File-Based Integration (Immediate)**
- Watch Claude Code workspace for todo files (CLAUDE.md, README.md, etc.)
- Parse todo items and sync with visualization
- Manual start/stop controls for sessions

### **Phase 2: Claude Code Skill Package (2 weeks)**
- Package as installable Claude Code skill
- Session lifecycle hooks (start/end/task updates)
- Integrated controls in Claude Code interface

### **Phase 3: Auto-Detection (Future)**
- Parse conversation context for tasks
- Auto-start visualizations for work sessions
- Smart pattern selection based on work type

---

## 🔧 **Phase 1: File-Based Integration**

### **File Watcher System**

```typescript
// skills/vibe-ui-watcher/src/fileWatcher.ts
import { watch } from 'fs';
import { WebSocket } from 'ws';
import { parseTodoFile } from './todoParser';

export class ClaudeCodeWatcher {
  private ws: WebSocket | null = null;
  private currentSession: string | null = null;
  private watchedFiles: string[] = [];

  constructor(private vibeUIPort = 3002) {
    this.connectToVibeUI();
  }

  // Connect to Vibe UI WebSocket server
  private async connectToVibeUI(): Promise<void> {
    try {
      this.ws = new WebSocket(`ws://localhost:${this.vibeUIPort}`);
      
      this.ws.on('open', () => {
        console.log('🌟 Connected to Vibe UI');
        this.startWatchingFiles();
      });

      this.ws.on('error', (error) => {
        console.log('⚠️ Vibe UI not running. Start with: npm run start-vibe');
      });
    } catch (error) {
      console.log('💡 To use Vibe UI visualization: npm run start-vibe');
    }
  }

  // Watch common Claude Code files for todo changes
  private startWatchingFiles(): void {
    const watchFiles = [
      './CLAUDE.md',
      './README.md', 
      './TODO.md',
      './todos.md',
      './plan.md',
      './tasks.md'
    ];

    watchFiles.forEach(file => {
      try {
        const watcher = watch(file, (eventType, filename) => {
          if (eventType === 'change') {
            this.handleFileChange(file);
          }
        });

        this.watchedFiles.push(file);
        console.log(`👀 Watching ${file} for todo changes`);
        
        // Initial parse
        this.handleFileChange(file);
      } catch (error) {
        // File doesn't exist, skip silently
      }
    });
  }

  // Parse file and update visualization
  private async handleFileChange(filePath: string): Promise<void> {
    try {
      const todos = await parseTodoFile(filePath);
      
      if (todos.length > 0 && !this.currentSession) {
        // Start new session
        await this.startVibeSession(todos);
      } else if (this.currentSession) {
        // Update existing session
        await this.updateSessionProgress(todos);
      }
    } catch (error) {
      console.error('Error parsing todo file:', error);
    }
  }

  // Start new Vibe UI session based on todos
  private async startVibeSession(todos: TodoItem[]): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const sessionData = {
      type: 'pattern_start',
      payload: {
        patternType: this.selectPatternForTodos(todos),
        taskCount: todos.length,
        description: `Claude Code Session: ${todos.length} tasks`,
        source: 'claude-code-integration'
      }
    };

    this.ws.send(JSON.stringify(sessionData));
    
    // Store session for updates
    this.currentSession = `claude-session-${Date.now()}`;
    
    console.log(`🚀 Started Vibe UI session with ${todos.length} tasks`);
  }

  // Update session progress based on todo completion
  private async updateSessionProgress(todos: TodoItem[]): Promise<void> {
    if (!this.ws || !this.currentSession) return;

    for (const todo of todos) {
      if (todo.completed && !todo.syncedToVibe) {
        // Mark task as complete in visualization
        const completeData = {
          type: 'task_complete',
          payload: {
            sessionId: this.currentSession,
            taskId: `task-${todo.index}`,
            description: `✅ ${todo.text}`
          }
        };

        this.ws.send(JSON.stringify(completeData));
        todo.syncedToVibe = true;
        
        console.log(`✅ Synced completion: ${todo.text}`);
      }
    }
  }

  // Smart pattern selection based on todo content
  private selectPatternForTodos(todos: TodoItem[]): 'constellation' | 'neural' | 'garden' {
    const content = todos.map(t => t.text.toLowerCase()).join(' ');
    
    if (content.includes('debug') || content.includes('investigate') || content.includes('fix')) {
      return 'constellation'; // Best for debugging/investigation
    }
    
    if (content.includes('ai') || content.includes('model') || content.includes('analysis')) {
      return 'neural'; // Best for AI/ML work
    }
    
    if (content.includes('create') || content.includes('design') || content.includes('iterate')) {
      return 'garden'; // Best for creative work
    }
    
    return 'constellation'; // Default fallback
  }

  // Manual controls
  public async startSession(patternType: PatternType, taskCount: number, description?: string): Promise<void> {
    // Manual session start
  }

  public async completeTask(taskId: string, description?: string): Promise<void> {
    // Manual task completion
  }

  public async updateWorkState(status: 'idle' | 'thinking' | 'working' | 'complete'): Promise<void> {
    // Manual work state update
  }
}
```

### **Todo Parser**

```typescript
// skills/vibe-ui-watcher/src/todoParser.ts
import { readFile } from 'fs/promises';

export interface TodoItem {
  index: number;
  text: string;
  completed: boolean;
  syncedToVibe?: boolean;
  priority?: 'high' | 'medium' | 'low';
  category?: string;
}

export async function parseTodoFile(filePath: string): Promise<TodoItem[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return parseMarkdownTodos(content);
  } catch (error) {
    return [];
  }
}

function parseMarkdownTodos(content: string): TodoItem[] {
  const todos: TodoItem[] = [];
  const lines = content.split('\n');
  
  let todoIndex = 0;
  
  for (const line of lines) {
    // Parse various todo formats
    const todoPatterns = [
      /^[-*+]\s*\[([x\s])\]\s*(.+)$/i,     // - [x] Task
      /^(\d+\.)\s*\[([x\s])\]\s*(.+)$/i,   // 1. [x] Task  
      /^#*\s*TODO:?\s*(.+)$/i,             // ## TODO: Task
      /^#*\s*DONE:?\s*(.+)$/i,             // ## DONE: Task
      /^\s*✅\s*(.+)$/,                     // ✅ Task
      /^\s*🚀\s*(.+)$/,                     // 🚀 Task
      /^\s*⭐\s*(.+)$/,                     // ⭐ Task
    ];

    for (const pattern of todoPatterns) {
      const match = line.match(pattern);
      if (match) {
        let completed = false;
        let text = '';

        if (match[2] && match[3]) {
          // Checkbox format: - [x] Task
          completed = match[2].toLowerCase() === 'x';
          text = match[3].trim();
        } else if (match[1]) {
          // Other formats
          text = match[1].trim();
          completed = line.includes('DONE') || line.includes('✅');
        }

        if (text.length > 0) {
          todos.push({
            index: todoIndex++,
            text,
            completed,
            syncedToVibe: false,
            priority: extractPriority(text),
            category: extractCategory(text)
          });
        }
        break;
      }
    }
  }
  
  return todos;
}

function extractPriority(text: string): 'high' | 'medium' | 'low' {
  const lower = text.toLowerCase();
  if (lower.includes('urgent') || lower.includes('critical') || lower.includes('!!!')) {
    return 'high';
  }
  if (lower.includes('important') || lower.includes('!!')) {
    return 'medium'; 
  }
  return 'low';
}

function extractCategory(text: string): string {
  const categories = [
    'setup', 'design', 'implementation', 'testing', 
    'deployment', 'documentation', 'optimization', 'debugging'
  ];
  
  const lower = text.toLowerCase();
  return categories.find(cat => lower.includes(cat)) || 'general';
}
```

---

## 📦 **Phase 2: Claude Code Skill Package**

### **Skill Structure**

```
vibe-ui-integration/
├── package.json
├── skill.json                 # Skill metadata
├── README.md
├── src/
│   ├── index.ts              # Main skill entry point
│   ├── vibeIntegration.ts    # Core integration logic
│   ├── fileWatcher.ts        # File watching system
│   ├── todoParser.ts         # Todo parsing logic
│   ├── sessionManager.ts     # Session lifecycle management
│   └── commands/             # CLI commands
│       ├── start.ts          # Start visualization
│       ├── stop.ts           # Stop visualization
│       ├── complete.ts       # Mark task complete
│       └── status.ts         # Update work status
├── vibe-ui-server/           # Bundled Vibe UI server
│   ├── package.json
│   ├── index.js
│   └── static/               # React build
└── examples/
    ├── basic-usage.md
    └── advanced-integration.md
```

### **Skill Metadata**

```json
// skill.json
{
  "name": "vibe-ui-integration",
  "version": "1.0.0",
  "description": "Ambient work visualization for Claude Code sessions",
  "author": "Claude + User Collaboration",
  "keywords": ["visualization", "productivity", "ambient", "particles", "patterns"],
  "category": "productivity",
  
  "entry": "src/index.ts",
  "commands": {
    "start-vibe": "src/commands/start.ts",
    "stop-vibe": "src/commands/stop.ts", 
    "vibe-complete": "src/commands/complete.ts",
    "vibe-status": "src/commands/status.ts"
  },
  
  "hooks": {
    "session:start": "onSessionStart",
    "session:end": "onSessionEnd",
    "file:change": "onFileChange",
    "task:complete": "onTaskComplete"
  },
  
  "dependencies": {
    "ws": "^8.16.0",
    "chokidar": "^3.5.3"
  },
  
  "configuration": {
    "autoStart": true,
    "defaultPattern": "constellation",
    "vibeUIPort": 3002,
    "watchFiles": ["CLAUDE.md", "README.md", "TODO.md"]
  },
  
  "requirements": {
    "node": ">=16.0.0",
    "ports": [3002, 3000]
  }
}
```

### **Main Skill Entry Point**

```typescript
// src/index.ts
import { ClaudeCodeSkill } from '@claude-code/skill-framework';
import { VibeIntegration } from './vibeIntegration';

export class VibeUISkill extends ClaudeCodeSkill {
  private integration: VibeIntegration;

  constructor() {
    super();
    this.integration = new VibeIntegration();
  }

  // Called when Claude Code session starts
  async onSessionStart(context: SessionContext): Promise<void> {
    console.log('🌟 Starting Vibe UI for Claude Code session');
    
    if (this.config.autoStart) {
      await this.integration.startWatching(context.workspaceRoot);
    }
  }

  // Called when Claude Code session ends
  async onSessionEnd(context: SessionContext): Promise<void> {
    console.log('👋 Stopping Vibe UI session');
    await this.integration.stopSession();
  }

  // Called when files change in workspace
  async onFileChange(filePath: string, eventType: string): Promise<void> {
    if (this.isWatchedFile(filePath)) {
      await this.integration.handleFileChange(filePath);
    }
  }

  // Manual commands
  async startVisualization(patternType?: string, taskCount?: number): Promise<void> {
    return this.integration.startManualSession(patternType, taskCount);
  }

  async completeTask(taskDescription: string): Promise<void> {
    return this.integration.completeTask(taskDescription);
  }

  async updateWorkState(status: WorkState): Promise<void> {
    return this.integration.updateWorkState(status);
  }

  private isWatchedFile(filePath: string): boolean {
    const watchedExtensions = ['.md', '.txt', '.todo'];
    const watchedNames = ['CLAUDE', 'README', 'TODO', 'TASKS', 'PLAN'];
    
    return watchedExtensions.some(ext => filePath.endsWith(ext)) ||
           watchedNames.some(name => filePath.toUpperCase().includes(name));
  }
}

// Export skill for Claude Code registration
export default new VibeUISkill();
```

### **CLI Commands**

```typescript
// src/commands/start.ts
import { Command } from '@claude-code/cli';
import { VibeUISkill } from '../index';

export const startCommand = new Command('start-vibe')
  .description('Start ambient work visualization')
  .option('-p, --pattern <type>', 'Pattern type: constellation, neural, garden', 'constellation')
  .option('-t, --tasks <count>', 'Number of tasks', '6')
  .option('-d, --description <text>', 'Session description')
  .action(async (options) => {
    const skill = new VibeUISkill();
    await skill.startVisualization(options.pattern, parseInt(options.tasks));
    
    console.log('🚀 Vibe UI visualization started!');
    console.log(`   Pattern: ${options.pattern}`);
    console.log(`   Tasks: ${options.tasks}`);
    console.log('   View at: http://localhost:3000');
    console.log('\nUse "vibe-complete <description>" to mark tasks complete');
  });

// src/commands/complete.ts  
export const completeCommand = new Command('vibe-complete')
  .description('Mark a task as complete in the visualization')
  .argument('<description>', 'Task description')
  .action(async (description) => {
    const skill = new VibeUISkill();
    await skill.completeTask(description);
    console.log(`✅ Completed: ${description}`);
  });

// src/commands/status.ts
export const statusCommand = new Command('vibe-status')
  .description('Update work status')
  .argument('<status>', 'Work status: idle, thinking, working, complete')
  .action(async (status) => {
    const skill = new VibeUISkill();
    await skill.updateWorkState(status as WorkState);
    console.log(`🎯 Status updated to: ${status}`);
  });
```

---

## 🚀 **Installation & Usage**

### **Installation**

```bash
# Install the Vibe UI integration skill
npx skills add vibe-ui-integration

# Or install from local development
cd vibe-ui-integration
npm run build
npx skills add . --local

# Verify installation
npx skills list
# Should show: vibe-ui-integration v1.0.0
```

### **Usage in Claude Code**

```bash
# Start ambient visualization (auto-detects todos)
start-vibe

# Start specific pattern with task count
start-vibe --pattern neural --tasks 8 --description "ML model training"

# Manual task completion
vibe-complete "Implemented data preprocessing pipeline"

# Update work state
vibe-status thinking
vibe-status working
vibe-status complete

# Stop visualization
stop-vibe
```

### **Auto-Integration**

Once installed, the skill automatically:

1. **Watches your workspace** for todo files (CLAUDE.md, README.md, etc.)
2. **Starts visualizations** when todos are detected
3. **Syncs progress** as you complete tasks
4. **Celebrates completion** when all tasks are done

### **Manual Integration**

For more control, disable auto-start and use commands:

```typescript
// .claude/config.json
{
  "skills": {
    "vibe-ui-integration": {
      "autoStart": false,
      "defaultPattern": "constellation"
    }
  }
}
```

---

## 🔧 **Configuration Options**

### **Skill Configuration**

```json
// .claude/skills/vibe-ui-integration.json
{
  "autoStart": true,
  "defaultPattern": "constellation", 
  "patternSelection": {
    "debugging": "constellation",
    "ai_ml": "neural", 
    "creative": "garden"
  },
  "visualization": {
    "particleCount": 300,
    "celebrationDuration": 3000,
    "transitionSpeed": 2000
  },
  "server": {
    "port": 3002,
    "autoStart": true,
    "logLevel": "info"
  },
  "watching": {
    "files": ["CLAUDE.md", "README.md", "TODO.md", "tasks.md"],
    "debounceMs": 500,
    "ignorePatterns": ["node_modules/**", ".git/**"]
  }
}
```

### **Workspace-Specific Settings**

```yaml
# .claude/workspace.yml
vibe-ui:
  enabled: true
  pattern: neural  # Override for this project
  autoPatternSelection: true
  taskPatterns:
    - "- [ ] *"     # Standard markdown todos
    - "TODO: *"     # Simple todos
    - "🚀 *"        # Rocket todos
    - "⭐ *"        # Priority todos
```

---

## 🧪 **Testing & Development**

### **Local Development**

```bash
# Clone and setup
git clone <repo>
cd vibe-ui-integration
npm install

# Start development servers
npm run dev:vibe-ui    # Start Vibe UI server
npm run dev:skill      # Start skill in watch mode  

# Test with sample workspace
cd examples/sample-workspace
code .                 # Open in Claude Code
# Skill should auto-activate and watch for changes
```

### **Testing with Real Workspaces**

```bash
# Test in your actual Claude Code projects
cd your-project/
echo "- [ ] Test task 1" >> README.md
echo "- [x] Completed task" >> README.md

# Watch console for Vibe UI sync messages
# Visit http://localhost:3000 to see visualization
```

### **Integration Testing**

```typescript
// tests/integration.test.ts
describe('Vibe UI Claude Code Integration', () => {
  test('should start session when todos detected', async () => {
    const skill = new VibeUISkill();
    await skill.onFileChange('README.md', 'change');
    
    expect(vibeUIConnected).toBe(true);
    expect(activeSession).toBeDefined();
  });

  test('should complete tasks when markdown updated', async () => {
    // Write completed todo to file
    await writeFile('TODO.md', '- [x] Test task');
    
    // Skill should sync completion
    await waitFor(() => {
      expect(completedTasks).toContain('Test task');
    });
  });
});
```

---

## 📊 **Success Metrics**

### **Phase 1 Success Criteria**
- ✅ File watcher detects todo changes in <500ms
- ✅ Visualization starts automatically for 3+ todos
- ✅ Task completions sync in real-time
- ✅ Works with common todo formats (markdown, plain text)

### **Phase 2 Success Criteria**
- ✅ Skill installs and activates in Claude Code
- ✅ Session lifecycle hooks work correctly
- ✅ CLI commands provide manual control
- ✅ Configuration options work as expected
- ✅ Zero-config experience for most users

### **User Experience Goals**
- 🎯 "It just works" - no setup required
- 🎯 Enhances focus rather than distracts
- 🎯 Makes work progress tangible and rewarding
- 🎯 Integrates seamlessly with existing workflows

---

## 🛣️ **Roadmap**

### **Phase 3: Advanced Features (Future)**

```typescript
// Advanced conversation parsing
class ConversationAnalyzer {
  async detectTasks(conversationContext: string): TodoItem[] {
    // Parse Claude responses for task suggestions
    // Extract action items from natural conversation
    // Detect completion signals in follow-up messages
  }
  
  async classifyWorkType(context: string): PatternType {
    // AI-powered pattern selection based on conversation content
    // Learn user preferences over time
    // Context-aware recommendations
  }
}

// Smart notifications
class VibeNotifications {
  async celebrateCompletion(pattern: string): Promise<void> {
    // OS notifications for major milestones
    // Integration with system tray/menu bar
    // Optional sound effects synchronized with visuals
  }
}

// Multi-project support
class WorkspaceManager {
  async switchProject(projectPath: string): Promise<void> {
    // Maintain separate sessions per project
    // Cross-project pattern persistence
    // Team collaboration features
  }
}
```

### **Integration Ecosystem**

- **VS Code Extension**: Unified experience across editors
- **GitHub Integration**: Visualize issue/PR progress
- **Linear/Notion**: Sync with external task managers
- **Time Tracking**: Pomodoro timer integration
- **Team Features**: Shared visualizations for pair programming

---

## ✅ **Implementation Checklist**

### **Phase 1: File-Based (This Week)**
- [ ] Create file watcher service
- [ ] Build todo parser with multiple format support
- [ ] Test with sample workspaces
- [ ] Add error handling and reconnection logic
- [ ] Document setup and usage

### **Phase 2: Skill Package (Next 2 Weeks)**
- [ ] Package skill with proper metadata
- [ ] Implement session lifecycle hooks
- [ ] Create CLI commands for manual control
- [ ] Add configuration system
- [ ] Build installation process
- [ ] Create comprehensive documentation
- [ ] Test with real Claude Code installations

### **Phase 3: Publishing & Distribution**
- [ ] Publish to Claude Code skill registry
- [ ] Create demo videos and screenshots
- [ ] Gather user feedback and iterate
- [ ] Plan advanced features based on usage

---

**Ready to make every Claude Code session beautifully visual! 🌟**

*This integration plan transforms the vibe-ui system from a standalone demo into a living productivity companion that grows and celebrates alongside your actual work in Claude Code.*
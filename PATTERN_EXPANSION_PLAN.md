# Vibe UI 2.0 - Pattern Expansion Plan
## Neural Network & Garden Growth Implementation

**Document Version**: 1.0  
**Created**: March 11, 2026  
**Status**: Ready for execution  
**Estimated Timeline**: 3 weeks  

---

## 🎯 **Executive Summary**

This document outlines the implementation plan for adding two distinct visualization patterns to the existing vibe-ui system:

1. **🧠 Neural Network Pattern** - Brain synapses for AI/ML and complex analysis work
2. **🌱 Garden Growth Pattern** - Organic plant growth for creative and iterative projects

Both patterns will integrate seamlessly with the existing constellation pattern, providing users with contextually appropriate visualizations for different types of work.

---

## 📋 **Current State Assessment**

### ✅ **Existing Foundation (Completed)**
- Constellation pattern with particle magnetism system
- Performance-optimized particle system (200-500 adaptive particles)
- WebSocket real-time integration
- Canvas rendering with smooth animations
- Work state behaviors (idle, thinking, working, complete)

### 🆕 **New Additions Required**
- Pattern-specific layout algorithms
- Enhanced particle behaviors for each pattern
- Pattern-aware rendering system
- Smooth transition animations between patterns
- Updated UI controls for pattern selection

---

## 🧠 **Pattern 1: Neural Network**

### **Visual Concept**
- **Metaphor**: Brain synapses firing and creating neural pathways
- **Structure**: 3-5 layered network with nodes (neurons) and connections (synapses)
- **Best For**: AI/ML work, debugging, complex problem-solving, data analysis
- **Task Range**: 5-15 tasks (distributed across network layers)

### **Technical Specifications**

#### Data Structures
```typescript
interface NeuralNode extends PatternPosition {
  layer: number;        // 0-4 (input to output layers)
  activation: number;   // 0-1 intensity
  connections: number[]; // Connected node indices
  nodeType: 'input' | 'hidden' | 'output';
}

interface NeuralConnection {
  fromNode: number;
  toNode: number;
  strength: number;     // 0-1 based on task progress
  active: boolean;      // Currently transmitting
  pulsePosition: number; // 0-1 for electrical pulse animation
}

interface NeuralNetworkState {
  nodes: NeuralNode[];
  connections: NeuralConnection[];
  globalActivation: number; // Overall network intensity
}
```

#### Layout Algorithm
```typescript
class PatternGenerator {
  private generateNeuralNetwork(taskCount: number): PatternPosition[] {
    const layers = Math.min(5, Math.ceil(taskCount / 3)); // 3-5 layers
    const positions: PatternPosition[] = [];
    
    // Calculate layer distribution
    const layerSizes = this.distributeTasksAcrossLayers(taskCount, layers);
    
    for (let layerIndex = 0; layerIndex < layers; layerIndex++) {
      const nodesInLayer = layerSizes[layerIndex];
      const layerX = (this.width / (layers + 1)) * (layerIndex + 1);
      
      for (let nodeIndex = 0; nodeIndex < nodesInLayer; nodeIndex++) {
        const nodeY = (this.height / (nodesInLayer + 1)) * (nodeIndex + 1);
        
        positions.push({
          x: layerX + (Math.random() - 0.5) * 30, // Organic variation
          y: nodeY + (Math.random() - 0.5) * 30,
          index: positions.length,
          completed: false,
          metadata: { 
            layer: layerIndex,
            nodeIndex,
            nodeType: this.getNodeType(layerIndex, layers),
            activation: 0,
            connections: []
          }
        });
      }
    }
    
    // Generate connections between adjacent layers
    this.generateNeuralConnections(positions, layers);
    
    return positions;
  }

  private distributeTasksAcrossLayers(taskCount: number, layers: number): number[] {
    // Input layer: 20%, Hidden layers: 60%, Output layer: 20%
    const sizes = new Array(layers).fill(0);
    sizes[0] = Math.max(1, Math.floor(taskCount * 0.2)); // Input
    sizes[layers - 1] = Math.max(1, Math.floor(taskCount * 0.2)); // Output
    
    const remaining = taskCount - sizes[0] - sizes[layers - 1];
    const hiddenLayers = layers - 2;
    
    for (let i = 1; i < layers - 1; i++) {
      sizes[i] = Math.floor(remaining / hiddenLayers);
    }
    
    // Distribute any remainder
    let distributed = sizes.reduce((a, b) => a + b, 0);
    for (let i = 1; i < layers - 1 && distributed < taskCount; i++) {
      sizes[i]++;
      distributed++;
    }
    
    return sizes;
  }

  private generateNeuralConnections(nodes: PatternPosition[], layers: number): void {
    // Connect nodes between adjacent layers
    for (let layer = 0; layer < layers - 1; layer++) {
      const currentLayerNodes = nodes.filter(n => n.metadata.layer === layer);
      const nextLayerNodes = nodes.filter(n => n.metadata.layer === layer + 1);
      
      currentLayerNodes.forEach(fromNode => {
        nextLayerNodes.forEach(toNode => {
          // Add connection with some probability for sparsity
          if (Math.random() > 0.3) { // 70% connection probability
            fromNode.metadata.connections.push(toNode.index);
          }
        });
      });
    }
  }
}
```

#### Particle Behavior System
```typescript
class ParticleSystem {
  private applyNeuralBehavior(particle: Particle, rhythmPulse: number): void {
    switch (this.workState.status) {
      case 'idle':
        // Subtle random neural firing (background brain activity)
        if (Math.random() < 0.02) { // 2% chance per frame
          particle.vx += (Math.random() - 0.5) * 0.5;
          particle.vy += (Math.random() - 0.5) * 0.5;
        }
        break;
        
      case 'thinking':
        // Increased activation with directional bias toward layers
        const layerBias = this.calculateLayerBias(particle);
        particle.vx += Math.sin(this.time * 0.01 + particle.x * 0.02) * rhythmPulse * 1.5;
        particle.vy += layerBias * rhythmPulse;
        break;
        
      case 'working':
        // Strong synaptic firing - electrical impulses
        const synapticPulse = Math.sin(this.time * 0.02) > 0.7 ? 4 : 0.2;
        particle.vx += (Math.random() - 0.5) * synapticPulse;
        particle.vy += (Math.random() - 0.5) * synapticPulse;
        
        // Add electrical "snap" effect
        if (Math.random() < 0.05) {
          particle.vx *= 1.8;
          particle.vy *= 1.8;
        }
        break;
        
      case 'complete':
        // Full network activation - cascading waves
        const wavePhase = Math.sin(this.time * 0.008 + particle.x * 0.01);
        particle.vx += wavePhase * 3;
        particle.vy += Math.cos(this.time * 0.008 + particle.y * 0.01) * 3;
        break;
    }
  }

  private calculateLayerBias(particle: Particle): number {
    // Create bias toward neural layer progression (left to right)
    const targetLayer = this.getCurrentActiveLayer();
    const targetX = (this.canvas.width / 5) * (targetLayer + 1);
    return (targetX - particle.x) * 0.001; // Subtle bias
  }
}
```

#### Neural Network Rendering
```typescript
function renderNeuralNetwork(
  ctx: CanvasRenderingContext2D,
  positions: PatternPosition[],
  particles: Particle[],
  timestamp: number
): void {
  const globalPulse = Math.sin(timestamp * 0.008) * 0.4 + 0.6;
  
  // 1. Render neural connections (synapses)
  renderNeuralConnections(ctx, positions, globalPulse);
  
  // 2. Render electrical pulses along active connections
  renderElectricalPulses(ctx, positions, timestamp);
  
  // 3. Render neurons with activation states
  renderNeurons(ctx, positions, globalPulse);
  
  // 4. Render particles as neural signals
  renderNeuralSignals(ctx, particles, timestamp);
}

function renderNeuralConnections(ctx: CanvasRenderingContext2D, positions: PatternPosition[], pulse: number): void {
  ctx.strokeStyle = `rgba(100, 255, 100, ${0.2 * pulse})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  
  positions.forEach(fromNode => {
    fromNode.metadata.connections.forEach(connectionIndex => {
      const toNode = positions[connectionIndex];
      if (!toNode) return;
      
      const connectionStrength = (fromNode.progress || 0) * (toNode.progress || 0);
      if (connectionStrength > 0.1) {
        ctx.strokeStyle = `rgba(100, 255, 100, ${connectionStrength * pulse * 0.6})`;
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
      }
    });
  });
  
  ctx.stroke();
}

function renderElectricalPulses(ctx: CanvasRenderingContext2D, positions: PatternPosition[], timestamp: number): void {
  const pulseSpeed = timestamp * 0.005;
  
  positions.forEach(fromNode => {
    if (!fromNode.completed) return;
    
    fromNode.metadata.connections.forEach(connectionIndex => {
      const toNode = positions[connectionIndex];
      if (!toNode || toNode.progress < 0.3) return;
      
      // Calculate pulse position along connection
      const pulsePosition = (pulseSpeed + fromNode.index * 0.3) % 1;
      const pulseX = fromNode.x + (toNode.x - fromNode.x) * pulsePosition;
      const pulseY = fromNode.y + (toNode.y - fromNode.y) * pulsePosition;
      
      // Render electrical pulse
      const gradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 100, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pulseX, pulseY, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

function renderNeurons(ctx: CanvasRenderingContext2D, positions: PatternPosition[], pulse: number): void {
  positions.forEach(node => {
    const activation = node.completed ? 1.0 : (node.progress || 0);
    const nodeSize = 8 + activation * 6; // 8-14px based on activation
    
    // Outer glow based on activation
    const glowSize = nodeSize * 3;
    const gradient = ctx.createRadialGradient(
      node.x, node.y, 0,
      node.x, node.y, glowSize
    );
    
    gradient.addColorStop(0, `rgba(100, 255, 100, ${activation * pulse * 0.8})`);
    gradient.addColorStop(0.5, `rgba(100, 255, 100, ${activation * pulse * 0.3})`);
    gradient.addColorStop(1, 'rgba(100, 255, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Core neuron
    ctx.fillStyle = activation > 0.8 
      ? `rgba(255, 255, 100, ${pulse})` // Active neurons are bright yellow
      : `rgba(150, 255, 150, ${0.7 + activation * 0.3})`; // Inactive are green
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Neuron border
    ctx.strokeStyle = activation > 0.5 ? '#ffff00' : '#66ff66';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}
```

---

## 🌱 **Pattern 2: Garden Growth**

### **Visual Concept**
- **Metaphor**: Seeds growing into flowering plants and trees with interconnected root systems
- **Structure**: Ground-level seeds growing upward into diverse plant species
- **Best For**: Creative projects, iterative development, organic workflows, long-term growth
- **Task Range**: 4-12 tasks (each becomes a different plant)

### **Technical Specifications**

#### Data Structures
```typescript
interface GardenElement extends PatternPosition {
  plantType: PlantSpecies;
  growthStage: number;  // 0-1 from seed to full bloom
  parentId?: string;    // For branching connections
  species: {
    maxHeight: number;
    bloomColor: string;
    leafShape: 'round' | 'pointed' | 'broad';
    growthPattern: 'upward' | 'spreading' | 'branching';
  };
}

interface RootConnection {
  fromPlant: number;
  toPlant: number;
  nutrients: Particle[]; // Flowing underground
  strength: number;      // Network connectivity
}

interface GardenState {
  plants: GardenElement[];
  rootNetwork: RootConnection[];
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  soilLevel: number;     // Y-coordinate of ground
}

type PlantSpecies = 'flower' | 'tree' | 'vine' | 'shrub' | 'grass';
```

#### Layout Algorithm
```typescript
class PatternGenerator {
  private generateGarden(taskCount: number): PatternPosition[] {
    const positions: PatternPosition[] = [];
    const soilLevel = this.height * 0.75; // Ground at 75% down
    const plantSpecies = this.selectPlantVariety(taskCount);
    
    // Plant seeds with organic spacing
    for (let i = 0; i < taskCount; i++) {
      const species = plantSpecies[i];
      const spacing = this.calculateOptimalSpacing(i, taskCount, species);
      
      positions.push({
        x: spacing.x,
        y: soilLevel + (Math.random() - 0.5) * 30, // Soil depth variation
        index: i,
        completed: false,
        metadata: {
          plantType: species.type,
          growthStage: 0,
          species: species.config,
          soilDepth: Math.random() * 20 + 10,
          rootConnections: []
        }
      });
    }
    
    // Generate underground root network connections
    this.generateRootNetwork(positions);
    
    return positions;
  }

  private selectPlantVariety(taskCount: number): PlantConfig[] {
    const varieties: PlantConfig[] = [];
    
    for (let i = 0; i < taskCount; i++) {
      const species = this.weightedSpeciesSelection();
      varieties.push({
        type: species,
        config: this.getSpeciesConfig(species)
      });
    }
    
    return varieties;
  }

  private weightedSpeciesSelection(): PlantSpecies {
    const weights = {
      flower: 0.4,   // 40% flowers (quick growing, colorful)
      tree: 0.2,     // 20% trees (slow growing, large)
      vine: 0.15,    // 15% vines (spreading, connecting)
      shrub: 0.15,   // 15% shrubs (medium growth)
      grass: 0.1     // 10% grass (background fill)
    };
    
    const random = Math.random();
    let cumulative = 0;
    
    for (const [species, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return species as PlantSpecies;
      }
    }
    
    return 'flower';
  }

  private getSpeciesConfig(species: PlantSpecies): SpeciesConfig {
    const configs = {
      flower: {
        maxHeight: 60,
        bloomColor: this.getRandomFlowerColor(),
        leafShape: 'round',
        growthPattern: 'upward',
        bloomSize: 12,
        growthSpeed: 1.2
      },
      tree: {
        maxHeight: 150,
        bloomColor: '#228B22',
        leafShape: 'broad',
        growthPattern: 'branching',
        bloomSize: 8,
        growthSpeed: 0.6
      },
      vine: {
        maxHeight: 40,
        bloomColor: '#32CD32',
        leafShape: 'pointed',
        growthPattern: 'spreading',
        bloomSize: 6,
        growthSpeed: 1.0
      },
      shrub: {
        maxHeight: 80,
        bloomColor: '#9ACD32',
        leafShape: 'round',
        growthPattern: 'spreading',
        bloomSize: 10,
        growthSpeed: 0.8
      },
      grass: {
        maxHeight: 25,
        bloomColor: '#90EE90',
        leafShape: 'pointed',
        growthPattern: 'upward',
        bloomSize: 3,
        growthSpeed: 1.5
      }
    };
    
    return configs[species];
  }

  private calculateOptimalSpacing(index: number, total: number, species: PlantConfig): { x: number; y: number } {
    // Use golden ratio for natural spacing
    const goldenRatio = 1.618;
    const angle = index * 2 * Math.PI / goldenRatio;
    const radius = Math.sqrt(index) * 30; // Spiral outward
    
    const centerX = this.width * 0.5;
    const baseX = centerX + Math.cos(angle) * radius;
    
    // Ensure plants stay within canvas bounds with species-appropriate spacing
    const minX = species.config.maxHeight;
    const maxX = this.width - species.config.maxHeight;
    
    return {
      x: Math.max(minX, Math.min(maxX, baseX)),
      y: this.height * 0.75 // Soil level
    };
  }

  private generateRootNetwork(positions: PatternPosition[]): void {
    // Connect nearby plants with underground root networks
    positions.forEach((plant, i) => {
      positions.forEach((other, j) => {
        if (i >= j) return; // Avoid duplicates
        
        const distance = Math.sqrt(
          Math.pow(plant.x - other.x, 2) + 
          Math.pow(plant.y - other.y, 2)
        );
        
        // Connect plants within root reach
        const maxRootReach = 120;
        if (distance < maxRootReach) {
          plant.metadata.rootConnections.push({
            targetIndex: j,
            strength: 1 - (distance / maxRootReach), // Closer = stronger
            nutrientFlow: 0
          });
        }
      });
    });
  }
}
```

#### Garden Particle Behavior
```typescript
class ParticleSystem {
  private applyGardenBehavior(particle: Particle, rhythmPulse: number): void {
    const soilLevel = this.canvas.height * 0.75;
    
    switch (this.workState.status) {
      case 'idle':
        // Gentle swaying like leaves in breeze
        particle.vx += Math.sin(this.time * 0.002 + particle.x * 0.01) * rhythmPulse * 0.3;
        particle.vy += Math.cos(this.time * 0.0015 + particle.y * 0.01) * rhythmPulse * 0.2;
        break;
        
      case 'thinking':
        // Seeds beginning to sprout - underground root exploration
        if (particle.y > soilLevel) {
          // Underground nutrients flowing through roots
          particle.vx += (Math.random() - 0.5) * rhythmPulse * 0.5;
          particle.vy += (Math.random() - 0.3) * rhythmPulse * 0.3; // Slight upward bias
        } else {
          // Above ground - gentle preparation energy
          particle.vx += Math.sin(this.time * 0.003) * rhythmPulse * 0.4;
        }
        break;
        
      case 'working':
        // Active growth spurts - strong upward nutrient flow
        if (particle.y > soilLevel) {
          // Underground: strong nutrient transportation
          particle.vy -= rhythmPulse * 1.5; // Strong upward flow
          particle.vx += (Math.random() - 0.5) * rhythmPulse * 0.8;
        } else {
          // Above ground: growth energy radiating outward
          particle.vy -= rhythmPulse * 0.8; // Upward growth energy
          particle.vx += Math.sin(this.time * 0.005 + particle.x * 0.02) * rhythmPulse * 1.2;
        }
        break;
        
      case 'complete':
        // Full bloom - pollen and seeds dispersing
        const bloomExplosion = Math.sin(this.time * 0.01) * 2;
        particle.vx += (Math.random() - 0.5) * bloomExplosion;
        particle.vy += (Math.random() - 0.7) * bloomExplosion; // Upward bias for floating pollen
        
        // Add special pollen behavior
        if (particle.magnetism > 0.8) {
          this.applyPollenBehavior(particle, rhythmPulse);
        }
        break;
    }
  }

  private applyPollenBehavior(particle: Particle, rhythmPulse: number): void {
    // Pollen floats and drifts in air currents
    particle.vy -= 0.1; // Natural buoyancy
    particle.vx += Math.sin(this.time * 0.004 + particle.y * 0.01) * 0.5; // Wind effect
    
    // Random air current turbulence
    if (Math.random() < 0.1) {
      particle.vx += (Math.random() - 0.5) * 2;
      particle.vy += (Math.random() - 0.5) * 1;
    }
  }
}
```

#### Garden Growth Rendering
```typescript
function renderGarden(
  ctx: CanvasRenderingContext2D,
  positions: PatternPosition[],
  particles: Particle[],
  timestamp: number
): void {
  const season = calculateCurrentSeason(timestamp);
  const seasonalTint = getSeasonalColorTint(season);
  
  // 1. Render soil line and underground area
  renderSoilEnvironment(ctx, seasonalTint);
  
  // 2. Render underground root network
  renderRootNetwork(ctx, positions, seasonalTint);
  
  // 3. Render growing plants
  renderPlants(ctx, positions, season, timestamp);
  
  // 4. Render nutrient particles and pollen
  renderGardenParticles(ctx, particles, season, timestamp);
  
  // 5. Render environmental effects
  renderEnvironmentalEffects(ctx, season, timestamp);
}

function renderSoilEnvironment(ctx: CanvasRenderingContext2D, seasonalTint: string): void {
  const soilLevel = ctx.canvas.height * 0.75;
  
  // Underground soil gradient
  const soilGradient = ctx.createLinearGradient(0, soilLevel, 0, ctx.canvas.height);
  soilGradient.addColorStop(0, 'rgba(101, 67, 33, 0.3)'); // Rich topsoil
  soilGradient.addColorStop(1, 'rgba(62, 39, 35, 0.5)');  // Deep earth
  
  ctx.fillStyle = soilGradient;
  ctx.fillRect(0, soilLevel, ctx.canvas.width, ctx.canvas.height - soilLevel);
  
  // Soil surface line
  ctx.strokeStyle = 'rgba(101, 67, 33, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, soilLevel);
  ctx.lineTo(ctx.canvas.width, soilLevel);
  ctx.stroke();
}

function renderRootNetwork(ctx: CanvasRenderingContext2D, positions: PatternPosition[], seasonalTint: string): void {
  const soilLevel = ctx.canvas.height * 0.75;
  
  ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)'; // Brown roots
  ctx.lineWidth = 1.5;
  
  positions.forEach(plant => {
    plant.metadata.rootConnections.forEach(connection => {
      const target = positions[connection.targetIndex];
      if (!target) return;
      
      // Only render root connections underground
      const rootY1 = Math.max(plant.y, soilLevel + 10);
      const rootY2 = Math.max(target.y, soilLevel + 10);
      
      // Draw organic root curve
      const midX = (plant.x + target.x) / 2;
      const midY = Math.max(rootY1, rootY2) + 20; // Curve deeper underground
      
      ctx.beginPath();
      ctx.moveTo(plant.x, rootY1);
      ctx.quadraticCurveTo(midX, midY, target.x, rootY2);
      ctx.stroke();
      
      // Add nutrient flow visualization if active
      if (connection.nutrientFlow > 0.3) {
        renderNutrientFlow(ctx, plant.x, rootY1, target.x, rootY2, midX, midY, connection.nutrientFlow);
      }
    });
  });
}

function renderPlants(
  ctx: CanvasRenderingContext2D,
  positions: PatternPosition[],
  season: Season,
  timestamp: number
): void {
  positions.forEach(plant => {
    const growth = plant.completed ? 1.0 : (plant.progress || 0);
    
    switch (plant.metadata.plantType) {
      case 'flower':
        renderFlower(ctx, plant, growth, season, timestamp);
        break;
      case 'tree':
        renderTree(ctx, plant, growth, season, timestamp);
        break;
      case 'vine':
        renderVine(ctx, plant, growth, season, timestamp);
        break;
      case 'shrub':
        renderShrub(ctx, plant, growth, season, timestamp);
        break;
      case 'grass':
        renderGrass(ctx, plant, growth, season, timestamp);
        break;
    }
  });
}

function renderFlower(
  ctx: CanvasRenderingContext2D,
  plant: PatternPosition,
  growth: number,
  season: Season,
  timestamp: number
): void {
  const config = plant.metadata.species;
  const stemHeight = config.maxHeight * growth;
  const bloomSize = config.bloomSize * Math.min(growth * 1.5, 1); // Bloom appears at 67% growth
  
  // Stem
  ctx.strokeStyle = '#228B22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(plant.x, plant.y);
  ctx.lineTo(plant.x, plant.y - stemHeight);
  ctx.stroke();
  
  // Leaves along stem
  if (growth > 0.3) {
    renderLeaves(ctx, plant.x, plant.y - stemHeight * 0.3, plant.y - stemHeight * 0.7, config.leafShape);
  }
  
  // Flower bloom
  if (growth > 0.6) {
    const bloomX = plant.x;
    const bloomY = plant.y - stemHeight;
    const petals = 6;
    const pulse = Math.sin(timestamp * 0.003) * 0.1 + 0.9; // Gentle breathing
    
    // Outer petals
    ctx.fillStyle = config.bloomColor;
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const petalX = bloomX + Math.cos(angle) * bloomSize * pulse;
      const petalY = bloomY + Math.sin(angle) * bloomSize * pulse;
      
      ctx.beginPath();
      ctx.arc(petalX, petalY, bloomSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Flower center
    ctx.fillStyle = '#FFD700'; // Golden center
    ctx.beginPath();
    ctx.arc(bloomX, bloomY, bloomSize * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderTree(
  ctx: CanvasRenderingContext2D,
  plant: PatternPosition,
  growth: number,
  season: Season,
  timestamp: number
): void {
  const config = plant.metadata.species;
  const trunkHeight = config.maxHeight * growth * 0.7; // Trunk is 70% of height
  const canopySize = config.maxHeight * growth * 0.5; // Canopy is 50% of height
  
  // Trunk
  ctx.strokeStyle = '#8B4513'; // Brown trunk
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(plant.x, plant.y);
  ctx.lineTo(plant.x, plant.y - trunkHeight);
  ctx.stroke();
  
  // Canopy (if grown enough)
  if (growth > 0.4) {
    const canopyY = plant.y - trunkHeight;
    const seasonalColor = getSeasonalLeafColor(season);
    
    // Multiple layers for natural look
    for (let layer = 0; layer < 3; layer++) {
      const layerSize = canopySize * (1 - layer * 0.2);
      const layerY = canopyY - layer * 10;
      
      ctx.fillStyle = `rgba(${seasonalColor.r}, ${seasonalColor.g}, ${seasonalColor.b}, 0.7)`;
      ctx.beginPath();
      ctx.arc(plant.x, layerY, layerSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Branches (if mature)
  if (growth > 0.7) {
    renderBranches(ctx, plant.x, plant.y - trunkHeight, trunkHeight * 0.3, 3);
  }
}

function renderGardenParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  season: Season,
  timestamp: number
): void {
  particles.forEach(particle => {
    if (particle.magnetism > 0.5) {
      // Nutrient particles (underground or flowing to plants)
      renderNutrient(ctx, particle, timestamp);
    } else {
      // Free-floating pollen or seeds
      renderPollen(ctx, particle, season, timestamp);
    }
  });
}

function renderNutrient(ctx: CanvasRenderingContext2D, particle: Particle, timestamp: number): void {
  const pulse = Math.sin(timestamp * 0.005 + particle.x * 0.02) * 0.3 + 0.7;
  
  // Glowing nutrient particle
  const gradient = ctx.createRadialGradient(
    particle.x, particle.y, 0,
    particle.x, particle.y, particle.size * 3
  );
  gradient.addColorStop(0, `rgba(255, 215, 0, ${particle.alpha * pulse})`); // Golden nutrients
  gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Core particle
  ctx.fillStyle = `rgba(255, 255, 100, ${particle.alpha * pulse})`;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.fill();
}

function renderPollen(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  season: Season,
  timestamp: number
): void {
  const flutter = Math.sin(timestamp * 0.008 + particle.x * 0.03) * 2;
  const pollenColors = {
    spring: 'rgba(255, 255, 150, 0.8)',
    summer: 'rgba(255, 200, 100, 0.7)',
    autumn: 'rgba(255, 150, 50, 0.6)',
    winter: 'rgba(200, 200, 255, 0.4)'
  };
  
  // Floating pollen with trail
  ctx.fillStyle = pollenColors[season];
  ctx.beginPath();
  ctx.arc(particle.x + flutter, particle.y, particle.size * 0.8, 0, Math.PI * 2);
  ctx.fill();
  
  // Subtle trail effect
  ctx.fillStyle = `rgba(255, 255, 150, ${particle.alpha * 0.3})`;
  ctx.beginPath();
  ctx.arc(particle.x - particle.vx * 2, particle.y - particle.vy * 2, particle.size * 0.4, 0, Math.PI * 2);
  ctx.fill();
}
```

---

## 🔄 **Pattern Transition System**

### **Smooth Morphing Between Patterns**

```typescript
class PatternTransitionManager {
  private transitionProgress = 0;
  private transitionDuration = 2000; // 2 seconds
  private fromPattern: PatternType;
  private toPattern: PatternType;
  private isTransitioning = false;
  private fromPositions: PatternPosition[] = [];
  private toPositions: PatternPosition[] = [];

  startTransition(from: PatternType, to: PatternType, fromPos: PatternPosition[], toPos: PatternPosition[]): void {
    this.fromPattern = from;
    this.toPattern = to;
    this.fromPositions = fromPos;
    this.toPositions = toPos;
    this.transitionProgress = 0;
    this.isTransitioning = true;
    
    console.log(`Starting transition from ${from} to ${to}`);
  }

  update(deltaTime: number): boolean {
    if (!this.isTransitioning) return false;
    
    this.transitionProgress += deltaTime / this.transitionDuration;
    
    if (this.transitionProgress >= 1) {
      this.transitionProgress = 1;
      this.isTransitioning = false;
      return true; // Transition complete
    }
    
    return false;
  }

  // Smoothly interpolate particle targets during transition
  getInterpolatedPositions(): PatternPosition[] {
    if (!this.isTransitioning) return this.toPositions;
    
    const easedProgress = this.easeInOutCubic(this.transitionProgress);
    const maxPositions = Math.max(this.fromPositions.length, this.toPositions.length);
    const interpolated: PatternPosition[] = [];
    
    for (let i = 0; i < maxPositions; i++) {
      const fromPos = this.fromPositions[i] || this.getDefaultPosition(i);
      const toPos = this.toPositions[i] || this.getDefaultPosition(i);
      
      interpolated.push({
        ...toPos,
        x: this.lerp(fromPos.x, toPos.x, easedProgress),
        y: this.lerp(fromPos.y, toPos.y, easedProgress),
        // Interpolate metadata for smooth visual transitions
        metadata: this.interpolateMetadata(fromPos.metadata, toPos.metadata, easedProgress)
      });
    }
    
    return interpolated;
  }

  // Pattern-aware particle behavior during transitions
  getTransitionParticleBehavior(): ParticleBehaviorModifier {
    if (!this.isTransitioning) return null;
    
    return {
      turbulence: this.transitionProgress * 2, // Peak turbulence at 50%
      attraction: 1 - this.transitionProgress * 0.5, // Reduce attraction during transition
      specialEffects: this.getTransitionEffects()
    };
  }

  private getTransitionEffects(): TransitionEffect[] {
    const effects: TransitionEffect[] = [];
    
    // Pattern-specific transition effects
    if (this.fromPattern === 'constellation' && this.toPattern === 'neural') {
      effects.push({
        type: 'starsToBrain',
        intensity: this.transitionProgress,
        description: 'Stars connecting into neural pathways'
      });
    } else if (this.fromPattern === 'neural' && this.toPattern === 'garden') {
      effects.push({
        type: 'synapsesToRoots',
        intensity: this.transitionProgress,
        description: 'Neural networks growing into root systems'
      });
    } else if (this.fromPattern === 'garden' && this.toPattern === 'constellation') {
      effects.push({
        type: 'bloomsToStars',
        intensity: this.transitionProgress,
        description: 'Flowers releasing pollen that becomes stars'
      });
    }
    
    return effects;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private getDefaultPosition(index: number): PatternPosition {
    // Return center screen position for missing positions
    return {
      x: 400, // Assume 800px width
      y: 300, // Assume 600px height
      index,
      completed: false,
      metadata: {}
    };
  }

  private interpolateMetadata(from: any, to: any, progress: number): any {
    // Smoothly transition metadata properties
    const interpolated = { ...to };
    
    // Interpolate numeric properties
    for (const key of ['activation', 'growthStage', 'intensity']) {
      if (typeof from[key] === 'number' && typeof to[key] === 'number') {
        interpolated[key] = this.lerp(from[key], to[key], progress);
      }
    }
    
    return interpolated;
  }
}
```

---

## 🎛️ **Enhanced UI Controls**

### **Pattern Selection Interface**

```tsx
interface PatternCardProps {
  pattern: PatternOption;
  isActive: boolean;
  onSelect: (pattern: PatternType, taskCount: number) => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, isActive, onSelect }) => {
  const [taskCount, setTaskCount] = useState(6);

  return (
    <div className={`pattern-card ${isActive ? 'active' : ''}`}>
      <div className="pattern-header">
        <div className="pattern-icon">{pattern.icon}</div>
        <h4 className="pattern-name">{pattern.name}</h4>
      </div>
      
      <div className="pattern-description">
        {pattern.description}
      </div>
      
      <div className="pattern-details">
        <div className="task-range">Best for: {pattern.taskRange}</div>
        <div className="use-cases">
          <span className="label">Perfect for:</span>
          <ul>
            {pattern.useCases.map(useCase => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="pattern-controls">
        <div className="task-count-selector">
          <label>Tasks: {taskCount}</label>
          <input 
            type="range" 
            min={pattern.minTasks} 
            max={pattern.maxTasks}
            value={taskCount}
            onChange={(e) => setTaskCount(parseInt(e.target.value))}
          />
        </div>
        
        <button 
          className="start-session-btn"
          onClick={() => onSelect(pattern.type, taskCount)}
        >
          Start {pattern.name} Session
        </button>
      </div>
      
      {/* Pattern preview animation */}
      <div className="pattern-preview">
        <PatternPreview 
          type={pattern.type} 
          taskCount={taskCount}
          animate={isActive}
        />
      </div>
    </div>
  );
};

const PatternSelector: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('constellation');
  
  const patterns: PatternOption[] = [
    {
      type: 'constellation',
      name: 'Constellation',
      icon: '⭐',
      description: 'Connected stars forming celestial patterns',
      taskRange: '3-8 tasks',
      minTasks: 3,
      maxTasks: 8,
      useCases: ['Debugging & investigation', 'Problem discovery', 'Sequential workflows']
    },
    {
      type: 'neural',
      name: 'Neural Network', 
      icon: '🧠',
      description: 'Brain synapses firing across network layers',
      taskRange: '5-15 tasks',
      minTasks: 5,
      maxTasks: 15,
      useCases: ['AI/ML development', 'Complex analysis', 'Data processing', 'Algorithm design']
    },
    {
      type: 'garden',
      name: 'Garden Growth',
      icon: '🌱', 
      description: 'Organic plant growth from seeds to blooming garden',
      taskRange: '4-12 tasks',
      minTasks: 4,
      maxTasks: 12,
      useCases: ['Creative projects', 'Iterative development', 'Long-term growth', 'Organic workflows']
    }
  ];

  return (
    <div className="pattern-selector">
      <h2>Choose Your Visualization</h2>
      <p className="selector-subtitle">Different patterns work best for different types of work</p>
      
      <div className="pattern-grid">
        {patterns.map(pattern => (
          <PatternCard
            key={pattern.type}
            pattern={pattern}
            isActive={selectedPattern === pattern.type}
            onSelect={(type, count) => {
              setSelectedPattern(type);
              onStartSession(type, count);
            }}
          />
        ))}
      </div>
      
      <div className="pattern-comparison">
        <h3>Pattern Comparison</h3>
        <ComparisonTable patterns={patterns} />
      </div>
    </div>
  );
};
```

### **Advanced Controls**

```tsx
const AdvancedControls: React.FC = () => {
  return (
    <div className="advanced-controls">
      <div className="control-section">
        <h4>Pattern Behavior</h4>
        <div className="control-group">
          <label>Growth Speed</label>
          <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" />
        </div>
        <div className="control-group">
          <label>Particle Density</label>
          <input type="range" min="100" max="500" step="50" defaultValue="200" />
        </div>
        <div className="control-group">
          <label>Connection Sensitivity</label>
          <input type="range" min="0.1" max="1" step="0.1" defaultValue="0.6" />
        </div>
      </div>
      
      <div className="control-section">
        <h4>Visual Effects</h4>
        <div className="control-group">
          <label>
            <input type="checkbox" defaultChecked /> 
            Celebration Animations
          </label>
        </div>
        <div className="control-group">
          <label>
            <input type="checkbox" defaultChecked /> 
            Particle Trails
          </label>
        </div>
        <div className="control-group">
          <label>
            <input type="checkbox" defaultChecked /> 
            Connection Lines
          </label>
        </div>
      </div>
      
      <div className="control-section">
        <h4>Pattern Transitions</h4>
        <div className="control-group">
          <label>Transition Duration</label>
          <input type="range" min="1" max="5" step="0.5" defaultValue="2" />
          <span>seconds</span>
        </div>
        <div className="control-group">
          <label>Auto-Pattern Selection</label>
          <select>
            <option value="manual">Manual</option>
            <option value="contextual">Based on work type</option>
            <option value="random">Surprise me</option>
          </select>
        </div>
      </div>
    </div>
  );
};
```

---

## 📊 **Implementation Timeline**

### **Week 1: Neural Network Pattern**
- **Day 1-2**: Extend PatternGenerator with neural network layout algorithm
- **Day 3**: Implement neural-specific particle behaviors
- **Day 4**: Create neural network rendering system (neurons, synapses, electrical pulses)
- **Day 5**: Testing and optimization

### **Week 2: Garden Growth Pattern**  
- **Day 1-2**: Implement garden layout with plant species variety
- **Day 3**: Create organic growth particle behaviors and nutrient flow
- **Day 4**: Build plant rendering system (flowers, trees, vines, growth stages)
- **Day 5**: Add root network and seasonal effects

### **Week 3: Integration & Polish**
- **Day 1-2**: Build smooth pattern transition system
- **Day 3**: Create enhanced UI with pattern selection and preview
- **Day 4**: Add advanced controls and settings
- **Day 5**: Testing, optimization, and documentation

---

## 🔧 **File Structure Updates**

```
src/
├── components/
│   ├── VisualizationCanvas.tsx (updated)
│   ├── ParticleSystem.ts (extended)
│   ├── PatternGenerator.ts (extended)
│   └── patterns/
│       ├── ConstellationPattern.ts (extracted)
│       ├── NeuralNetworkPattern.ts (new)
│       └── GardenPattern.ts (new)
├── renderers/
│   ├── BaseRenderer.ts (new)
│   ├── ConstellationRenderer.ts (new)
│   ├── NeuralRenderer.ts (new)
│   └── GardenRenderer.ts (new)
├── transitions/
│   ├── PatternTransitionManager.ts (new)
│   └── TransitionEffects.ts (new)
├── ui/
│   ├── PatternSelector.tsx (new)
│   ├── AdvancedControls.tsx (new)
│   └── PatternPreview.tsx (new)
└── types/
    ├── patterns.ts (extended)
    └── transitions.ts (new)
```

---

## 🎯 **Success Criteria**

### **Technical Goals**
- ✅ Maintain 60fps with all three patterns
- ✅ Smooth transitions between patterns (<2 seconds)
- ✅ Pattern-specific particle behaviors feel natural and distinct
- ✅ Rendering optimizations handle increased complexity

### **User Experience Goals**
- ✅ Intuitive pattern selection based on work type
- ✅ Clear visual differences between patterns
- ✅ Satisfying completion animations for each pattern
- ✅ Contextual appropriateness for different workflows

### **Integration Goals**
- ✅ WebSocket API supports pattern selection
- ✅ External systems can specify preferred patterns
- ✅ Backward compatibility with existing constellation sessions

---

## 📝 **API Extensions**

### **Updated WebSocket Messages**

```typescript
// Start pattern session with specific type
{
  type: 'pattern_start',
  payload: {
    patternType: 'neural' | 'garden' | 'constellation',
    taskCount: number,
    description: string,
    preferences?: {
      growthSpeed?: number,
      particleDensity?: number,
      enableTransitions?: boolean
    }
  }
}

// Request pattern transition
{
  type: 'pattern_transition',
  payload: {
    sessionId: string,
    newPatternType: PatternType,
    transitionDuration?: number
  }
}

// Pattern suggestion based on context
{
  type: 'pattern_suggest',
  payload: {
    workContext: 'debugging' | 'creative' | 'analysis' | 'iterative',
    taskCount: number
  }
}
```

### **REST API Endpoints**

```bash
# Start specific pattern
POST /api/pattern/start
{
  "type": "neural",
  "taskCount": 8, 
  "description": "ML model training workflow"
}

# Transition existing session
POST /api/pattern/transition
{
  "sessionId": "session-123",
  "newPattern": "garden", 
  "reason": "switching to iterative development"
}

# Get pattern recommendations
GET /api/pattern/recommend?context=debugging&tasks=6
Response: {
  "recommended": "constellation",
  "alternatives": ["neural"],
  "reasoning": "Sequential investigation works best with connected star patterns"
}
```

---

## 🚀 **Future Enhancements**

### **Phase 2 Additions**
1. **Audio Synchronization**: Different ambient sounds for each pattern
2. **Pattern Hybridization**: Combine elements from multiple patterns
3. **Custom Pattern Builder**: User-created pattern types
4. **AI Pattern Selection**: Machine learning to suggest optimal patterns
5. **Collaborative Patterns**: Multi-user shared visualizations

### **Advanced Features**
1. **Seasonal Garden Cycles**: Garden pattern changes over real time
2. **Neural Network Learning**: Connections strengthen based on usage patterns  
3. **Constellation Mythology**: Star patterns form recognizable shapes
4. **Pattern Persistence**: Save and restore favorite pattern configurations
5. **Performance Analytics**: Track which patterns boost productivity

---

## ✅ **Execution Checklist**

When ready to implement, follow this checklist:

### **Pre-Implementation**
- [ ] Review current codebase architecture
- [ ] Confirm performance baseline with existing pattern
- [ ] Set up feature branch: `feature/pattern-expansion`
- [ ] Update project dependencies if needed

### **Implementation**
- [ ] Week 1: Neural Network Pattern
  - [ ] Layout algorithm
  - [ ] Particle behaviors
  - [ ] Rendering system
  - [ ] Testing
- [ ] Week 2: Garden Growth Pattern
  - [ ] Organic layout system
  - [ ] Growth behaviors
  - [ ] Plant rendering
  - [ ] Root networks
- [ ] Week 3: Integration
  - [ ] Transition system
  - [ ] UI controls
  - [ ] Advanced settings
  - [ ] Documentation

### **Testing & Deployment**
- [ ] Performance testing with all patterns
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] WebSocket integration testing
- [ ] User acceptance testing
- [ ] Production deployment
- [ ] Monitor performance metrics

---

**Ready for execution when you decide it's time! 🚀**

*This document provides a complete roadmap for extending the vibe-ui system with two additional rich, contextually appropriate visualization patterns that will enhance the ambient productivity experience.*
import { PatternPosition } from '../types';

export type PatternType = 'constellation' | 'mandala' | 'circuit' | 'crystal' | 'spiral';

export class PatternGenerator {
  private width: number;
  private height: number;
  private centerX: number;
  private centerY: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.centerX = width / 2;
    this.centerY = height / 2;
  }

  // Generate pattern based on type
  generatePattern(patternType: PatternType, taskCount: number): PatternPosition[] {
    switch (patternType) {
      case 'constellation':
        return this.generateConstellation(taskCount);
      case 'mandala':
        return this.generateMandala(taskCount);
      case 'circuit':
        return this.generateCircuit(taskCount);
      case 'crystal':
        return this.generateCrystal(taskCount);
      case 'spiral':
        return this.generateSpiral(taskCount);
      default:
        return this.generateConstellation(taskCount);
    }
  }

  // Constellation: circular arrangement like stars in a constellation
  private generateConstellation(taskCount: number): PatternPosition[] {
    const positions: PatternPosition[] = [];
    const radius = Math.min(this.width, this.height) * 0.3;
    const angleStep = (Math.PI * 2) / taskCount;

    // Create a beautiful circular arrangement with slight organic variation
    for (let i = 0; i < taskCount; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      
      // Add slight randomization for organic feel
      const radiusVariation = radius + (Math.random() - 0.5) * 40;
      const angleVariation = angle + (Math.random() - 0.5) * 0.2;
      
      const x = this.centerX + Math.cos(angleVariation) * radiusVariation;
      const y = this.centerY + Math.sin(angleVariation) * radiusVariation;

      positions.push({
        x,
        y,
        index: i,
        completed: false
      });
    }

    return positions;
  }

  // Mandala: radiating rings and petals from center
  private generateMandala(taskCount: number): PatternPosition[] {
    const positions: PatternPosition[] = [];
    const rings = Math.ceil(Math.sqrt(taskCount));
    const maxRadius = Math.min(this.width, this.height) * 0.35;

    let taskIndex = 0;
    for (let ring = 0; ring < rings && taskIndex < taskCount; ring++) {
      const radius = (ring + 1) * (maxRadius / rings);
      const pointsInRing = ring === 0 ? 1 : Math.ceil(taskCount * (ring + 1) / (rings * 2));
      const angleStep = (Math.PI * 2) / Math.max(pointsInRing, 1);

      for (let i = 0; i < pointsInRing && taskIndex < taskCount; i++) {
        if (ring === 0) {
          // Center point
          positions.push({
            x: this.centerX,
            y: this.centerY,
            index: taskIndex++,
            completed: false
          });
        } else {
          const angle = i * angleStep + (ring * 0.3); // Offset each ring slightly
          const x = this.centerX + Math.cos(angle) * radius;
          const y = this.centerY + Math.sin(angle) * radius;

          positions.push({
            x,
            y,
            index: taskIndex++,
            completed: false
          });
        }
      }
    }

    return positions;
  }

  // Circuit: electronic pathways with right-angle connections
  private generateCircuit(taskCount: number): PatternPosition[] {
    const positions: PatternPosition[] = [];
    const gridSize = Math.ceil(Math.sqrt(taskCount));
    const spacing = Math.min(this.width, this.height) * 0.6 / gridSize;
    const startX = this.centerX - (spacing * (gridSize - 1)) / 2;
    const startY = this.centerY - (spacing * (gridSize - 1)) / 2;

    for (let i = 0; i < taskCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      // Create circuit-like pathways
      const x = startX + col * spacing + (row % 2) * spacing * 0.2; // Offset alternating rows
      const y = startY + row * spacing;

      positions.push({
        x,
        y,
        index: i,
        completed: false
      });
    }

    return positions;
  }

  // Crystal: hexagonal crystalline structure with branching facets
  private generateCrystal(taskCount: number): PatternPosition[] {
    const positions: PatternPosition[] = [];
    const baseRadius = Math.min(this.width, this.height) * 0.25;

    // Start with center
    positions.push({
      x: this.centerX,
      y: this.centerY,
      index: 0,
      completed: false
    });

    if (taskCount === 1) return positions;

    // Create hexagonal layers
    let taskIndex = 1;
    let layer = 1;
    
    while (taskIndex < taskCount) {
      const pointsInLayer = Math.min(6 * layer, taskCount - taskIndex);
      const radius = baseRadius * layer * 0.8;
      
      for (let i = 0; i < pointsInLayer && taskIndex < taskCount; i++) {
        const angle = (i / pointsInLayer) * Math.PI * 2;
        
        // Add crystalline variation
        const radiusVariation = radius + (Math.sin(angle * 3) * radius * 0.15);
        const x = this.centerX + Math.cos(angle) * radiusVariation;
        const y = this.centerY + Math.sin(angle) * radiusVariation;

        positions.push({
          x,
          y,
          index: taskIndex++,
          completed: false
        });
      }
      layer++;
    }

    return positions;
  }

  // Spiral: galaxy-like spiral arms extending outward
  private generateSpiral(taskCount: number): PatternPosition[] {
    const positions: PatternPosition[] = [];
    const maxRadius = Math.min(this.width, this.height) * 0.4;
    const spiralTurns = 2.5; // Number of full rotations

    for (let i = 0; i < taskCount; i++) {
      const progress = i / (taskCount - 1);
      const angle = progress * spiralTurns * Math.PI * 2;
      const radius = progress * maxRadius;
      
      // Add organic spiral variation
      const radiusVariation = radius + Math.sin(angle * 2) * radius * 0.1;
      const x = this.centerX + Math.cos(angle) * radiusVariation;
      const y = this.centerY + Math.sin(angle) * radiusVariation;

      positions.push({
        x,
        y,
        index: i,
        completed: false
      });
    }

    return positions;
  }

  // Get constellation connections for rendering guides
  getConstellationConnections(positions: PatternPosition[]): Array<[number, number]> {
    const connections: Array<[number, number]> = [];
    
    // Connect each star to the next one in sequence
    for (let i = 0; i < positions.length; i++) {
      const nextIndex = (i + 1) % positions.length;
      connections.push([i, nextIndex]);
    }

    // Optional: Add connections to center for more complex patterns
    if (positions.length >= 5) {
      // Connect every other point to create inner pattern
      for (let i = 0; i < positions.length; i += 2) {
        const targetIndex = (i + Math.floor(positions.length / 2)) % positions.length;
        connections.push([i, targetIndex]);
      }
    }

    return connections;
  }

  // Calculate if particles should be flowing toward pattern
  shouldShowFlowLines(completedCount: number, totalCount: number): boolean {
    return completedCount > 0 && completedCount < totalCount;
  }

  // Get pattern center for effects
  getCenter(): { x: number; y: number } {
    return { x: this.centerX, y: this.centerY };
  }

  // Update dimensions when canvas resizes
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.centerX = width / 2;
    this.centerY = height / 2;
  }

  // Get pattern bounds for boundary calculations
  getPatternBounds(positions: PatternPosition[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    if (positions.length === 0) {
      return { minX: 0, maxX: this.width, minY: 0, maxY: this.height };
    }

    let minX = positions[0].x;
    let maxX = positions[0].x;
    let minY = positions[0].y;
    let maxY = positions[0].y;

    positions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });

    return { minX, maxX, minY, maxY };
  }
}
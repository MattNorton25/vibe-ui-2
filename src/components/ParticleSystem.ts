import { Particle, PatternPosition, WorkState } from '../types';
import { PerformanceMonitor, ObjectPool, CanvasOptimizer } from '../utils/performance';

export class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private time: number = 0;
  private workState: WorkState = { status: 'idle', intensity: 0.1 };
  
  // Performance optimizations
  private performanceMonitor = new PerformanceMonitor();
  private canvasOptimizer: CanvasOptimizer;
  private particlePool: ObjectPool<Particle>;
  private frameSkipCounter = 0;

  // Physics constants optimized for smooth particle behavior
  private readonly FRICTION = 0.98;
  private readonly MAGNETISM_STRENGTH = 0.02;
  private readonly RANDOM_FORCE = 0.1;
  private readonly BOUNDARY_BUFFER = 50;

  constructor(canvas: HTMLCanvasElement, particleCount: number = 200) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvasOptimizer = new CanvasOptimizer(canvas);
    
    // Initialize object pool for particle reuse
    this.particlePool = new ObjectPool<Particle>(
      () => this.createParticle(),
      (particle) => this.resetParticle(particle),
      particleCount + 50 // Extra buffer
    );
    
    this.initializeParticles(particleCount);
  }

  // Initialize particles with physics-based distribution
  private initializeParticles(count: number): void {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.particlePool.get());
    }
  }

  // Create new particle (used by object pool)
  private createParticle(): Particle {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: this.getParticleColor(),
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.7 + 0.3,
      magnetism: 0, // No target initially
    };
  }

  // Reset particle for reuse
  private resetParticle(particle: Particle): void {
    particle.x = Math.random() * this.canvas.width;
    particle.y = Math.random() * this.canvas.height;
    particle.vx = (Math.random() - 0.5) * 2;
    particle.vy = (Math.random() - 0.5) * 2;
    particle.color = this.getParticleColor();
    particle.size = Math.random() * 3 + 1;
    particle.alpha = Math.random() * 0.7 + 0.3;
    particle.magnetism = 0;
    particle.targetX = undefined;
    particle.targetY = undefined;
  }

  // Physics update loop with optimized calculations
  update(deltaTime: number, patternPositions: PatternPosition[] = []): void {
    this.time += deltaTime;
    
    // Performance monitoring
    this.performanceMonitor.recordFrame(this.time);
    
    // Skip frames if performance is poor
    if (this.performanceMonitor.shouldSkipFrame()) {
      this.frameSkipCounter++;
      if (this.frameSkipCounter % 2 !== 0) return; // Skip every other frame
    } else {
      this.frameSkipCounter = 0;
    }
    
    // Adaptive particle count based on performance
    const optimalCount = this.performanceMonitor.getOptimalParticleCount();
    this.adjustParticleCount(optimalCount);
    
    // Calculate rhythm-based intensity
    const rhythmPulse = this.calculateRhythm(this.time);
    
    // Batch update particles for better performance
    this.updateParticlesBatch(rhythmPulse);
  }

  // Batch particle updates for performance
  private updateParticlesBatch(rhythmPulse: number): void {
    const length = this.particles.length;
    
    for (let i = 0; i < length; i++) {
      const particle = this.particles[i];
      
      // Apply different behaviors based on work state
      this.applyWorkStateBehavior(particle, rhythmPulse);
      
      // Apply magnetism to pattern positions if assigned
      if (particle.targetX !== undefined && particle.targetY !== undefined) {
        this.applyMagnetism(particle);
      }
      
      // Apply physics forces
      this.applyPhysics(particle, rhythmPulse);
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply friction
      particle.vx *= this.FRICTION;
      particle.vy *= this.FRICTION;
      
      // Boundary physics with soft bounce
      this.handleBoundaries(particle);
    }
  }

  // Dynamically adjust particle count based on performance
  private adjustParticleCount(targetCount: number): void {
    const currentCount = this.particles.length;
    
    if (currentCount > targetCount) {
      // Remove particles
      const toRemove = currentCount - targetCount;
      for (let i = 0; i < toRemove; i++) {
        const particle = this.particles.pop();
        if (particle) this.particlePool.release(particle);
      }
    } else if (currentCount < targetCount) {
      // Add particles
      const toAdd = targetCount - currentCount;
      for (let i = 0; i < toAdd; i++) {
        this.particles.push(this.particlePool.get());
      }
    }
  }

  // Rhythm calculation for organic movement
  private calculateRhythm(time: number): number {
    const basePulse = Math.sin(time * 0.002) * 0.5 + 0.5; // 2Hz base
    const rapidPulse = Math.sin(time * 0.006) * 0.3 + 0.7; // 6Hz detail
    const slowWave = Math.sin(time * 0.0005) * 0.2 + 0.8; // 0.5Hz breathing
    return basePulse * rapidPulse * slowWave * this.workState.intensity;
  }

  // Work state specific particle behaviors
  private applyWorkStateBehavior(particle: Particle, rhythm: number): void {
    switch (this.workState.status) {
      case 'idle':
        // Gentle floating motion
        particle.vx += (Math.random() - 0.5) * this.RANDOM_FORCE * 0.5;
        particle.vy += (Math.random() - 0.5) * this.RANDOM_FORCE * 0.5;
        break;
        
      case 'thinking':
        // Swirling motion with rhythmic acceleration
        const swirl = Math.sin(this.time * 0.001 + particle.x * 0.01) * rhythm;
        particle.vx += swirl * 0.3;
        particle.vy += Math.cos(this.time * 0.001 + particle.y * 0.01) * rhythm * 0.3;
        break;
        
      case 'working':
        // Strong directional energy
        const workEnergy = rhythm * 2;
        particle.vx += (Math.random() - 0.5) * this.RANDOM_FORCE * workEnergy;
        particle.vy += (Math.random() - 0.5) * this.RANDOM_FORCE * workEnergy;
        break;
        
      case 'complete':
        // Explosive celebration
        const celebration = Math.sin(this.time * 0.01) * 3;
        particle.vx += (Math.random() - 0.5) * celebration;
        particle.vy += (Math.random() - 0.5) * celebration;
        break;
    }
  }

  // Magnetism physics for pattern attraction
  private applyMagnetism(particle: Particle): void {
    if (particle.targetX === undefined || particle.targetY === undefined) return;
    
    const dx = particle.targetX - particle.x;
    const dy = particle.targetY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      const force = this.MAGNETISM_STRENGTH * particle.magnetism;
      particle.vx += (dx / distance) * force;
      particle.vy += (dy / distance) * force;
    }
  }

  // Core physics calculations
  private applyPhysics(particle: Particle, rhythm: number): void {
    // Add slight downward gravity
    particle.vy += 0.01;
    
    // Add rhythm-based noise for organic movement
    const noise = rhythm * 0.02;
    particle.vx += (Math.random() - 0.5) * noise;
    particle.vy += (Math.random() - 0.5) * noise;
  }

  // Soft boundary handling
  private handleBoundaries(particle: Particle): void {
    const margin = this.BOUNDARY_BUFFER;
    
    if (particle.x < margin) {
      particle.vx += (margin - particle.x) * 0.01;
    }
    if (particle.x > this.canvas.width - margin) {
      particle.vx -= (particle.x - (this.canvas.width - margin)) * 0.01;
    }
    if (particle.y < margin) {
      particle.vy += (margin - particle.y) * 0.01;
    }
    if (particle.y > this.canvas.height - margin) {
      particle.vy -= (particle.y - (this.canvas.height - margin)) * 0.01;
    }
  }

  // Assign particles to pattern positions
  assignToPattern(positions: PatternPosition[]): void {
    const availableParticles = this.particles.filter(p => p.magnetism === 0);
    
    positions.forEach((position, index) => {
      if (index < availableParticles.length) {
        const particle = availableParticles[index];
        particle.targetX = position.x;
        particle.targetY = position.y;
        particle.magnetism = position.completed ? 1.0 : 0.3;
      }
    });
  }

  // Update work state
  updateWorkState(state: WorkState): void {
    this.workState = state;
  }

  // Get particles for rendering
  getParticles(): Particle[] {
    return this.particles;
  }

  // Get performance metrics
  getPerformanceMetrics(): { fps: number; particleCount: number; memoryOptimal: boolean } {
    return {
      fps: this.performanceMonitor.getFPS(),
      particleCount: this.particles.length,
      memoryOptimal: !this.performanceMonitor.shouldUseSimplifiedRendering()
    };
  }

  // Dynamic particle color based on state
  private getParticleColor(): string {
    const colors = {
      idle: '#4A90E2',
      thinking: '#F5A623',
      working: '#7ED321',
      complete: '#D0021B'
    };
    return colors[this.workState.status] || colors.idle;
  }

  // Resize handling
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
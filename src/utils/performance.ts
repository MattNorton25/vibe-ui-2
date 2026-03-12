// Performance optimization utilities for the particle system

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  private averageFPS = 60;

  // Track frame performance
  recordFrame(timestamp: number): void {
    if (this.lastFrameTime > 0) {
      const frameTime = timestamp - this.lastFrameTime;
      this.frameTimes.push(frameTime);
      
      // Keep only recent frames for average calculation
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift();
      }
      
      // Calculate average FPS
      const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      this.averageFPS = Math.round(1000 / averageFrameTime);
    }
    
    this.lastFrameTime = timestamp;
    this.frameCount++;
  }

  getFPS(): number {
    return this.averageFPS;
  }

  // Adaptive performance suggestions
  getOptimalParticleCount(): number {
    if (this.averageFPS > 55) return 500;
    if (this.averageFPS > 45) return 300;
    if (this.averageFPS > 30) return 200;
    return 100;
  }

  shouldUseSimplifiedRendering(): boolean {
    return this.averageFPS < 30;
  }

  shouldSkipFrame(): boolean {
    return this.averageFPS < 20;
  }
}

// Object pool for particle reuse (memory optimization)
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  size(): number {
    return this.pool.length;
  }
}

// Canvas optimization utilities
export class CanvasOptimizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDirty = true;
  private lastClearTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.optimizeContext();
  }

  private optimizeContext(): void {
    // Optimize canvas context for performance
    this.ctx.imageSmoothingEnabled = false; // Disable smoothing for pixel-perfect rendering
    this.ctx.globalCompositeOperation = 'source-over';
  }

  // Dirty rectangle optimization
  markDirty(): void {
    this.isDirty = true;
  }

  shouldRedraw(): boolean {
    return this.isDirty;
  }

  // Clear canvas with optimization
  clearCanvas(alpha = 0.1): void {
    const now = performance.now();
    
    // Only clear if enough time has passed (frame limiting)
    if (now - this.lastClearTime < 8) return; // ~120fps max
    
    this.ctx.fillStyle = `rgba(12, 12, 12, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.lastClearTime = now;
    this.isDirty = false;
  }

  // Batch operations for better performance
  beginBatch(): void {
    this.ctx.save();
  }

  endBatch(): void {
    this.ctx.restore();
  }
}

// Throttling utility for expensive operations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = performance.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Debouncing utility for resize/update events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Memory usage monitoring
export class MemoryMonitor {
  private samples: number[] = [];

  recordUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.samples.push(memory.usedJSHeapSize);
      
      // Keep only recent samples
      if (this.samples.length > 100) {
        this.samples.shift();
      }
    }
  }

  getAverageUsage(): number {
    if (this.samples.length === 0) return 0;
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }

  isMemoryPressureHigh(): boolean {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return usage > 0.8; // 80% memory usage threshold
    }
    return false;
  }
}
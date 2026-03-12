import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ParticleSystem } from './ParticleSystem';
import { PatternGenerator } from './PatternGenerator';
import { Particle, PatternPosition, WorkState, VibeSession } from '../types';

interface VisualizationCanvasProps {
  session: VibeSession | null;
  workState: WorkState;
  onAnimationFrame?: (fps: number) => void;
}

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  session,
  workState,
  onAnimationFrame
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particleSystemRef = useRef<ParticleSystem>();
  const patternGeneratorRef = useRef<PatternGenerator>();
  const lastTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0 });
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize systems when canvas is ready
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize systems
    particleSystemRef.current = new ParticleSystem(canvas, 200);
    patternGeneratorRef.current = new PatternGenerator(canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    
    setIsInitialized(true);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update particle targets when session changes
  useEffect(() => {
    if (!isInitialized || !particleSystemRef.current || !patternGeneratorRef.current) return;
    
    if (session) {
      const positions = patternGeneratorRef.current.generatePattern(
        session.patternType,
        session.tasks.length
      );
      
      // Update positions with task completion status
      const updatedPositions = positions.map((pos, index) => ({
        ...pos,
        completed: session.tasks[index]?.completed || false
      }));
      
      particleSystemRef.current.assignToPattern(updatedPositions);
    }
  }, [session, isInitialized]);

  // Update work state
  useEffect(() => {
    if (particleSystemRef.current) {
      particleSystemRef.current.updateWorkState(workState);
    }
  }, [workState]);

  // Animation loop with smooth timing and FPS monitoring
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const particleSystem = particleSystemRef.current;
    const patternGenerator = patternGeneratorRef.current;

    if (!canvas || !ctx || !particleSystem || !patternGenerator) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Calculate delta time for smooth animation
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // FPS monitoring
    fpsCounterRef.current.frames++;
    if (timestamp - fpsCounterRef.current.lastTime >= 1000) {
      const fps = fpsCounterRef.current.frames;
      onAnimationFrame?.(fps);
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = timestamp;
    }

    // Update particle physics
    const patternPositions = session 
      ? patternGenerator.generatePattern(session.patternType, session.tasks.length)
      : [];
    
    particleSystem.update(deltaTime, patternPositions);

    // Render frame with smooth transitions
    renderFrame(ctx, canvas, particleSystem, patternGenerator, timestamp);

    // Schedule next frame
    animationRef.current = requestAnimationFrame(animate);
  }, [session, onAnimationFrame]);

  // Start animation when initialized
  useEffect(() => {
    if (isInitialized) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInitialized, animate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
        borderRadius: '12px',
        transition: 'all 0.3s ease-in-out',
      }}
    />
  );
};

// Optimized rendering function with smooth effects
function renderFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  particleSystem: ParticleSystem,
  patternGenerator: PatternGenerator,
  timestamp: number
): void {
  const width = canvas.width / (window.devicePixelRatio || 1);
  const height = canvas.height / (window.devicePixelRatio || 1);

  // Clear canvas with fade trail effect
  ctx.fillStyle = 'rgba(12, 12, 12, 0.1)';
  ctx.fillRect(0, 0, width, height);

  // Get particles for rendering
  const particles = particleSystem.getParticles();

  // Render particle connections for constellation effect
  renderConnections(ctx, particles, timestamp);

  // Render particles with glow effects
  renderParticles(ctx, particles, timestamp);

  // Render pattern guides (subtle)
  renderPatternGuides(ctx, patternGenerator, timestamp);
}

// Render smooth connections between nearby particles
function renderConnections(ctx: CanvasRenderingContext2D, particles: Particle[], timestamp: number): void {
  const maxDistance = 120;
  const pulse = Math.sin(timestamp * 0.003) * 0.3 + 0.7;

  ctx.strokeStyle = `rgba(74, 144, 226, ${0.15 * pulse})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance && particles[i].magnetism > 0.5 && particles[j].magnetism > 0.5) {
        const alpha = (1 - distance / maxDistance) * 0.3;
        ctx.strokeStyle = `rgba(74, 144, 226, ${alpha * pulse})`;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
      }
    }
  }
  ctx.stroke();
}

// Render particles with glow and smooth scaling
function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[], timestamp: number): void {
  particles.forEach((particle, index) => {
    const glow = Math.sin(timestamp * 0.004 + index * 0.1) * 0.3 + 0.7;
    const scale = particle.magnetism > 0.8 ? 1.5 : 1.0;
    
    // Outer glow
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * scale * 3
    );
    
    gradient.addColorStop(0, `rgba(74, 144, 226, ${particle.alpha * glow * 0.8})`);
    gradient.addColorStop(0.5, `rgba(74, 144, 226, ${particle.alpha * glow * 0.3})`);
    gradient.addColorStop(1, 'rgba(74, 144, 226, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * scale * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core particle
    ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha * glow})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * scale, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Render subtle pattern guides
function renderPatternGuides(ctx: CanvasRenderingContext2D, patternGenerator: PatternGenerator, timestamp: number): void {
  const pulse = Math.sin(timestamp * 0.002) * 0.1 + 0.1;
  
  ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([5, 10]);
  
  // This would show the target pattern outline
  // Implementation depends on pattern type
  
  ctx.setLineDash([]);
}
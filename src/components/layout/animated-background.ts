import { gsap } from 'gsap';
import { setupBackgroundAnimations } from '../../animations/gsap-init';
import { body, createEl as createElement } from '../../utils/element-utilities';

export function createAnimatedBackground(): void {
  const animatedBackgroundContainer = createElement({
    tag: 'div',
    attributes: { id: 'animated-background-container' },
    classes: [
      'fixed',
      'top-0',
      'left-0',
      'w-screen',
      'h-screen',
      'z-[-1]',
      'overflow-hidden',
      'flex',
      'items-center',
      'justify-center',
    ],
    parent: body,
  });

  const canvas = createElement({
    tag: 'canvas',
    attributes: { id: 'bubblesCanvas' },
    parent: animatedBackgroundContainer,
  });

  if (!(canvas instanceof HTMLCanvasElement)) {
    console.error('Canvas element not found or is not an HTMLCanvasElement.');
    return;
  }

  const canvasElement: HTMLCanvasElement = canvas;

  const context = canvasElement.getContext('2d');
  if (!context) return;

  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  class Bubble {
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    dx = 0;
    dy = 0;
    radius = 20;
    maxRadius = 50;
    lifeTime = 0;
    createdAt = 0;
    gradient: CanvasGradient;

    constructor() {
      this.reset();
      this.gradient = this.createGradient();
    }

    reset(): void {
      this.x = Math.random() * canvasElement.width;
      this.y = Math.random() * canvasElement.height;
      this.radius = 0;
      this.maxRadius = 50;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.dx = 0;
      this.dy = 0;
      this.lifeTime = 4000 + Math.random() * 16_000;
      this.createdAt = Date.now();
    }

    createGradient(): CanvasGradient {
      if (!context)
        throw new Error('Canvas rendering context is not available');
      const gradientWidth = this.maxRadius * 0.4; // уменьшили ширину градиента
      const gradient = context.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        gradientWidth
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0.99)');
      gradient.addColorStop(0.8, 'rgba(0,0,0,0.65)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      return gradient;
    }

    update(): void {
      const age = Date.now() - this.createdAt;
      const progress = age / this.lifeTime;

      if (progress < 0.2) {
        this.radius = this.maxRadius * (progress / 0.2);
      } else if (progress > 0.8) {
        this.radius = this.maxRadius * (1 - (progress - 0.8) / 0.2);
      }

      this.x += this.vx;
      this.y += this.vy;

      if (age > this.lifeTime) this.reset();
    }

    draw(): void {
      if (!context) return;
      context.save();
      context.translate(this.x + this.dx, this.y + this.dy);
      context.beginPath();
      context.arc(0, 0, this.radius, 0, Math.PI * 2);
      context.fillStyle = this.gradient;
      context.fill();
      context.restore();
    }
  }

  const bubbles: Bubble[] = [];
  const maxBubbles = 15;

  function addBubble(): void {
    if (bubbles.length < maxBubbles) {
      bubbles.push(new Bubble());
    }
  }

  function startAddingBubbles(): void {
    const interval = Math.random() * 500 + 300;
    addBubble();
    setTimeout(startAddingBubbles, interval);
  }

  function animate(): void {
    if (!context) return;
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);

    for (const bubble of bubbles) {
      bubble.update();
      bubble.draw();
    }

    requestAnimationFrame(animate);
  }

  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const direction = currentScrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = currentScrollY;

    const offset = direction === 'down' ? -15 : 15;

    for (const bubble of bubbles) {
      gsap.to(bubble, {
        dx: bubble.dx + offset,
        dy: bubble.dy + offset,
        duration: 1,
        ease: 'power2.out',
      });
    }
  });

  startAddingBubbles();
  animate();

  window.addEventListener('resize', () => {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
    for (const bubble of bubbles) {
      bubble.reset();
    }
  });

  setupBackgroundAnimations();
}

import { createEl as createElement } from '../../utils/element-utilities';
import arrowImg from '../../assets/images/menu-arrow.svg';

export function createScrollTopButton(parent: HTMLElement): void {
  if (parent.querySelector('.scroll-top-btn') !== null) return;

  const button = createElement({
    tag: 'button',
    parent,
    classes: [
      'scroll-top-btn',
      'fixed',
      'bottom-5',
      'right-5',
      'w-12',
      'h-12',
      'rounded-full',
      'bg-white/60',
      'shadow-lg',
      'flex',
      'items-center',
      'justify-center',
      'opacity-0',
      'pointer-events-none',
      'transition-opacity',
    ],
    attributes: { 'aria-label': 'Scroll to top' },
  });

  createElement({
    tag: 'img',
    parent: button,
    classes: ['w-6', 'h-6', 'transform', '-rotate-90'],
    attributes: { src: arrowImg, alt: '' },
  });

  globalThis.addEventListener('scroll', () => {
    const visible = globalThis.scrollY > 300;
    button.classList.toggle('opacity-0', !visible);
    button.classList.toggle('pointer-events-none', !visible);
  });

  button.addEventListener('click', () => {
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

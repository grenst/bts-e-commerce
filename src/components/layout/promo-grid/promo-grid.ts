import { createEl as createElement } from '../../../utils/element-utilities';
import './promo-grid.scss';

export interface PromoGridOptions {
  parent: HTMLElement;
  images: [string, string, string, string, string];
  promoText?: string;
}

export function createPromoGrid({
  parent,
  images,
  promoText = '',
}: PromoGridOptions): void {
  const root = createElement({
    tag: 'section',
    classes: ['promo-grid', 'h-dvh'],
    parent,
  });

  for (const [index, source] of images.entries()) {
    root.style.setProperty(`--image-${index + 1}`, `url(${source})`);
  }

  const banner = createElement({
    tag: 'div',
    classes: ['promo-banner', 'cursor-pointer'],
    parent: root,
    text: promoText,
  });

  createElement({
    tag: 'div',
    classes: ['promo_banner_helper'],
    parent: banner,
    text: 'Tap to copy',
  });

  banner.addEventListener('click', () => {
    const match = promoText.match(/[A-Za-z0-9]+/u);
    if (match) {
      void navigator.clipboard.writeText(match[0]);

      // Create and show notification
      const notification = createElement({
        tag: 'div',
        classes: ['promo-notification'],
        parent: document.body,
        text: 'Promocode was copied',
      });

      // Position notification near the banner
      const bannerRect = banner.getBoundingClientRect();
      notification.style.top = `${bannerRect.bottom + 10}px`;
      notification.style.left = `${bannerRect.left}px`;

      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  });

  const grid = createElement({
    tag: 'div',
    classes: ['grid-container'],
    parent: root,
  });

  for (let col = 1; col <= 3; col += 1) {
    const column = createElement({
      tag: 'div',
      classes: ['column', `column-${col}`],
      parent: grid,
    });

    for (let item = 1; item <= 3; item += 1) {
      createElement({
        tag: 'div',
        classes: ['item', `item-${item}`],
        parent: column,
      });
    }
  }
}

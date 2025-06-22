import { newDrinksData } from '../../data/new-drinks-data';
import { createEl as createElement } from '../../utils/element-utilities';
import { initScrollReveal } from '../../utils/scroll-reveal';
import { createHelloSection } from '../../components/hello-section/create-hello-section';
import { createDrinkSection } from '../../components/new-drink/create-drink-section';
import { createScrollTopButton } from '../../components/features/scroll-top-button';
import { createPromoGrid } from '../../components/layout/promo-grid/promo-grid';

import videoIntro from '../../assets/video/intro.mp4';
import bg1 from '../../assets/images/drink1-bg.webp';
import bg2 from '../../assets/images/drink2-bg.webp';
import bg3 from '../../assets/images/drink3-bg.webp';
import ill1 from '../../assets/images/drink1-ill.webp';
import ill2 from '../../assets/images/drink2-ill.webp';
import ill3 from '../../assets/images/drink3-ill.webp';
import gridImg1 from '@/assets/images/grid-1.webp';
import gridImg2 from '@/assets/images/grid-2.webp';
import gridImg3 from '@/assets/images/grid-3.webp';
import gridImg4 from '@/assets/images/grid-4.webp';
import gridImg5 from '@/assets/images/grid-5.webp';

export default function mainNew(container: HTMLElement): void {
  const mainContainer = createElement({
    tag: 'div',
    classes: ['main-new-container'],
    parent: container,
  });

  // 1. hello-section
  createHelloSection(mainContainer, videoIntro);

  // New drink #1 - right content
  createDrinkSection(mainContainer, {
    id: 'new-drink-1-anchor',
    backgroundSrc: bg1,
    imageSrc: ill1,
    title: newDrinksData.drink_1.title,
    description: newDrinksData.drink_1.description,
    contentSide: 'right',
  });

  // New drink #2 - left content
  createDrinkSection(mainContainer, {
    id: 'new-drink-2-anchor',
    backgroundSrc: bg2,
    imageSrc: ill2,
    title: newDrinksData.drink_2.title,
    description: newDrinksData.drink_2.description,
    contentSide: 'left',
  });

  // New drink #3 - right content
  createDrinkSection(mainContainer, {
    id: 'new-drink-3-anchor',
    backgroundSrc: bg3,
    imageSrc: ill3,
    title: newDrinksData.drink_3.title,
    description: newDrinksData.drink_3.description,
    contentSide: 'right',
  });

  // block Actions (TO DO)
  const promoSection = createElement({
    tag: 'section',
    classes: [
      'scroll-reveal--hidden',
      'actions-section',
      'full-screen-section',
    ],
    attributes: { id: 'actions-anchor' },
    parent: mainContainer,
    // text: 'Actions Content',
  });

  createPromoGrid({
    parent: promoSection,
    images: [gridImg1, gridImg2, gridImg3, gridImg4, gridImg5],
    promoText: 'SUMMER15',
    // theme: 'light',
  });

  initScrollReveal(mainContainer);

  createScrollTopButton(document.body);
}

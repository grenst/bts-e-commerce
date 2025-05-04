import './footer.scss';

import { createEl, createSvgUse } from '../../../utils/elementUtils';

const createFooter = (parent: HTMLElement) => {
  const footer = createEl({ tag: 'footer', classes: ['footer'], parent });
  const footerContainer = createEl({
    classes: ['footer-container'],
    parent: footer,
  });
  const footerLinkGithub = createEl({
    tag: 'a',
    classes: ['footer-link', 'footer-container__github'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/grenst/bts-e-commerce/',
    },
    parent: footerContainer,
  });
  const svgGithub = createSvgUse('#github', 'footer-svg_github');
  footerLinkGithub.append(svgGithub);

  createEl({
    tag: 'p',
    text: "2025 Kat's Cats",
    classes: ['copyright'],
    parent: footerContainer,
  });

  const footerLinkRSS = createEl({
    tag: 'a',
    classes: ['footer-link', 'footer-container__rss'],
    attributes: {
      target: '_blank',
      href: 'https://rs.school/courses/javascript-ru',
    },
    parent: footerContainer,
  });
  const svgRSS = createSvgUse('#rss', 'footer-svg_rss');
  footerLinkRSS.append(svgRSS);
};

export default createFooter;

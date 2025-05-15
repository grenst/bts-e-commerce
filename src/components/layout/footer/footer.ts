import './footer.scss';

import {
  createEl as createElement,
  createSvgUse,
} from '../../../utils/element-utilities';

const createFooter = (parent: HTMLElement) => {
  const footer = createElement({ tag: 'footer', classes: ['footer'], parent });

  // container div info
  const infoDivFooterContainer = createElement({
    tag: 'div',
    classes: ['infoDivFooterContainer'],
    parent: footer,
  });

  const footerContainer = createElement({
    classes: ['footer-container'],
    parent: footer,
  });
  // container div info

  const ulContainerFooter = createElement({
    tag: 'ul',
    classes: ['ul-footer-container'],
    parent: infoDivFooterContainer,
  });

  // one section
  const liContainerTitleInfo = createElement({
    tag: 'li',
    classes: ['li-container-Contact-info'],
    parent: ulContainerFooter,
  });

  const h3TitleInfo = createElement({
    tag: 'h3',
    text: 'Информация',
    classes: ['h3-title-info'],
    parent: liContainerTitleInfo,
  });

  const ulContainerInfo = createElement({
    tag: 'ul',
    classes: ['ul-Container-Info'],
    parent: liContainerTitleInfo,
  });

  const liCompany = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerInfo,
  });

  const aLinkCompany = createElement({
    tag: 'a',
    text: 'О Компании',
    classes: ['yellow-lane'],
    attributes: {
      target: '_blank',
      href: '#',
    },
    parent: liCompany,
  });

  const liAkcia = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerInfo,
  });

  const aLinkAkcia = createElement({
    tag: 'a',
    text: 'Акции',
    classes: ['yellow-lane'],
    attributes: {
      target: '_blank',
      href: '#',
    },
    parent: liAkcia,
  });

  const liNyws = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerInfo,
  });

  const aLinkNyws = createElement({
    tag: 'a',
    text: 'Новинки',
    classes: ['yellow-lane'],
    attributes: {
      target: '_blank',
      href: '#',
    },
    parent: liNyws,
  });

  const liPayment = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerInfo,
  });

  const aLinkPayment = createElement({
    tag: 'a',
    text: 'Оплата',
    classes: ['yellow-lane'],
    attributes: {
      target: '_blank',
      href: '#',
    },
    parent: liPayment,
  });
  // one section

  // two section
  const liContainerAnchorLink = createElement({
    tag: 'li',
    classes: ['li-container-Contact-info'],
    parent: ulContainerFooter,
  });

  const h3TitleAncher = createElement({
    tag: 'h3',
    text: 'Навигация',
    classes: ['h3-title-info'],
    parent: liContainerAnchorLink,
  });

  const ulContainerAnchor = createElement({
    tag: 'ul',
    classes: ['ul-Container-Info'],
    parent: liContainerAnchorLink,
  });

  const liLogin = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerAnchor,
  });

  const aLinkLogin = createElement({
    tag: 'a',
    text: 'Логин',
    classes: ['yellow-lane'],
    attributes: {
      target: '_blank',
      href: '#',
    },
    parent: liLogin,
  });

  const liProfile = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerAnchor,
  });

  const aLinkProfile = createElement({
    tag: 'a',
    text: 'Профиль',
    classes: ['yellow-lane'],
    attributes: {
      target: '_blank',
      href: '#',
    },
    parent: liProfile,
  });

  const liBasket = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerAnchor,
  });

  const aLinkBasket = createElement({
    tag: 'a',
    text: 'Корзина',
    classes: ['yellow-lane'],
    attributes: {
      target: '_blank',
      href: '#',
    },
    parent: liBasket,
  });
  // two section

  // three section
  const liContainerRep = createElement({
    tag: 'li',
    classes: ['li-container-Contact-info'],
    parent: ulContainerFooter,
  });

  const h3TitleContactRep = createElement({
    tag: 'h3',
    text: 'Приложение',
    classes: ['h3-title-info'],
    parent: liContainerRep,
  });

  const footerLinkGithub = createElement({
    tag: 'a',
    classes: ['footer-link', 'footer-container__github'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/grenst/bts-e-commerce/',
    },
    parent: liContainerRep,
  });
  const svgGithub = createSvgUse('#github', 'footer-svg_github');
  footerLinkGithub.append(svgGithub);
  // three section

  // four section
  const liContainerSponsor = createElement({
    tag: 'li',
    classes: ['li-container-Contact-info'],
    parent: ulContainerFooter,
  });

  const h3TitleSponsor = createElement({
    tag: 'h3',
    text: 'Спонсоры',
    classes: ['h3-title-info'],
    parent: liContainerSponsor,
  });

  const footerLinkGithubKate = createElement({
    tag: 'a',
    classes: ['footer-link', 'footer-container__github'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/KateGoncharik',
    },
    text: 'Motivation-leader',
    parent: liContainerSponsor,
  });
  // const svgGithubKate = createSvgUse('#github', 'footer-svg_github');
  // footerLinkGithubKate.append(svgGithubKate);

  const footerLinkRSS = createElement({
    tag: 'a',
    classes: ['footer-link', 'footer-container__rss'],
    attributes: {
      target: '_blank',
      href: 'https://rs.school/courses/javascript-ru',
    },
    parent: liContainerSponsor,
  });
  const svgRSS = createSvgUse('#rss', 'footer-svg_rss');
  footerLinkRSS.append(svgRSS);
  // four section

  // five section
  const liContainerDevelopers = createElement({
    tag: 'li',
    classes: ['li-container-Contact-info'],
    parent: ulContainerFooter,
  });

  const h3TitleDevelopers = createElement({
    tag: 'h3',
    text: 'Связь с разработчиками',
    classes: ['h3-title-info'],
    parent: liContainerDevelopers,
  });

  const footerLinkGithubAndrei = createElement({
    tag: 'a',
    classes: ['footer-link', 'footer-container__github'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/grenst',
    },
    text: ' Team leader Андрей -',
    parent: liContainerDevelopers,
  });
  const svgGithubAndrei = createSvgUse('#github', 'footer-svg_github');
  footerLinkGithubAndrei.append(svgGithubAndrei);

  const footerLinkGithubVitaly = createElement({
    tag: 'a',
    classes: ['footer-link', 'footer-container__github'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/VitaliMay',
    },
    text: ' Main Developer Виталий -',
    parent: liContainerDevelopers,
  });
  const svgGithubVitaly = createSvgUse('#github', 'footer-svg_github');
  footerLinkGithubVitaly.append(svgGithubVitaly);

  const footerLinkGithubSergei = createElement({
    tag: 'a',
    classes: ['footer-link', 'footer-container__github'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/SeregaSimba',
    },
    text: ' Some kind of finishing developer Сергей -',
    parent: liContainerDevelopers,
  });
  const svgGithubSergei = createSvgUse('#github', 'footer-svg_github');
  footerLinkGithubSergei.append(svgGithubSergei);
  // five section

  createElement({
    tag: 'p',
    text: "© 2025  Kat's Cats",
    classes: ['copyright'],
    parent: footerContainer,
  });
};

export default createFooter;

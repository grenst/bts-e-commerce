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
  });
  liContainerTitleInfo.append(h3TitleInfo);

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
  });
  liCompany.append(aLinkCompany);

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
  });
  liAkcia.append(aLinkAkcia);

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
  });
  liNyws.append(aLinkNyws);

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
  });
  liPayment.append(aLinkPayment);
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
  });
  liContainerAnchorLink.append(h3TitleAncher);

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
  });
  liLogin.append(aLinkLogin);

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
  });
  liProfile.append(aLinkProfile);

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
  });
  liBasket.append(aLinkBasket);
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
  });
  liContainerRep.append(h3TitleContactRep);

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
  svgGithub.classList.add('kets');
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
  });
  liContainerSponsor.append(h3TitleSponsor);

  const footerLinkGithubKate = createElement({
    tag: 'a',
    classes: ['footer-link', 'footer-container__github', 'Kate-git'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/KateGoncharik',
    },
    text: 'Motivation-leader',
  });
  liContainerSponsor.append(footerLinkGithubKate);
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
  svgRSS.classList.add('background-RSS');
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
  });
  liContainerDevelopers.append(h3TitleDevelopers);

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

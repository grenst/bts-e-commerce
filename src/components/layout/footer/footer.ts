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
    text: 'Information',
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
    text: 'About the Company',
    classes: ['yellow-lane'],
    attributes: {
      href: '/about',
    },
  });
  liCompany.append(aLinkCompany);

  const liStocks = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerInfo,
  });

  const aLinkStocks = createElement({
    tag: 'a',
    text: 'Stocks',
    classes: ['yellow-lane'],
    attributes: {
      href: '#',
    },
  });
  liStocks.append(aLinkStocks);

  const liNew = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerInfo,
  });

  const aLinkNew = createElement({
    tag: 'a',
    text: 'New products',
    classes: ['yellow-lane'],
    attributes: {
      href: '#',
    },
  });
  liNew.append(aLinkNew);

  const liPayment = createElement({
    tag: 'li',
    classes: ['li-Company'],
    parent: ulContainerInfo,
  });

  const aLinkPayment = createElement({
    tag: 'a',
    text: 'Payment',
    classes: ['yellow-lane'],
    attributes: {
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

  const h3TitleAnchor = createElement({
    tag: 'h3',
    text: 'Navigation',
    classes: ['h3-title-info'],
  });
  liContainerAnchorLink.append(h3TitleAnchor);

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
    text: 'Login',
    classes: ['yellow-lane'],
    attributes: {
      href: '/login',
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
    text: 'Profile',
    classes: ['yellow-lane'],
    attributes: {
      href: '/profile',
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
    text: 'Baskets',
    classes: ['yellow-lane'],
    attributes: {
      href: '/cart',
    },
  });
  liBasket.append(aLinkBasket);
  // two section

  // four section
  const liContainerSponsor = createElement({
    tag: 'li',
    classes: ['li-container-Contact-info'],
    parent: ulContainerFooter,
  });

  const h3TitleSponsor = createElement({
    tag: 'h3',
    text: 'Sponsors',
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
    classes: ['footer-linkRss', 'footer-container__rss'],
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

  // three section
  const liContainerRep = createElement({
    tag: 'li',
    classes: ['li-container-Contact-info'],
    parent: ulContainerFooter,
  });

  const h3TitleContactRep = createElement({
    tag: 'h3',
    text: 'Application',
    classes: ['h3-title-info'],
  });
  liContainerRep.append(h3TitleContactRep);

  const footerLinkGithub = createElement({
    tag: 'a',
    classes: ['footer-linkGit', 'footer-container__github'],
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

  // five section
  const liContainerDevelopers = createElement({
    tag: 'li',
    classes: ['li-container-Contact-info'],
    parent: ulContainerFooter,
  });

  const h3TitleDevelopers = createElement({
    tag: 'h3',
    text: 'Developers',
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
    text: ' - Developer Andrey -',
  });
  liContainerDevelopers.append(footerLinkGithubAndrei);
  // const svgGithubAndrei = createSvgUse('#github', 'footer-svg_github');
  // footerLinkGithubAndrei.prepend(svgGithubAndrei);

  const footerLinkGithubVitaly = createElement({
    tag: 'a',
    classes: ['footer-link', 'footer-container__github'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/VitaliMay',
    },
    text: '- Developer Vitaly -',
  });
  liContainerDevelopers.append(footerLinkGithubVitaly);
  // const svgGithubVitaly = createSvgUse('#github', 'footer-svg_github');
  // footerLinkGithubVitaly.prepend(svgGithubVitaly);

  const footerLinkGithubSergei = createElement({
    tag: 'a',
    classes: ['footer-link', 'footer-container__github'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/SeregaSimba',
    },
    text: ' - Developer Sergei -',
  });
  liContainerDevelopers.append(footerLinkGithubSergei);
  // const svgGithubSergei = createSvgUse('#github', 'footer-svg_github');
  // footerLinkGithubSergei.prepend(svgGithubSergei);
  // five section

  const linkTuDisc = createElement({
    tag: 'a',
    text: "© 2025  Kat's Cats",
    classes: ['copyright', 'link-Tu-Disc'],
    attributes: {
      target: '_blank',
      href: 'https://discord.com/channels/1363555884193546390/1363555884193546393',
    },
  });
  footerContainer.append(linkTuDisc);
};

export default createFooter;

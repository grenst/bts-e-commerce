import { 
  createEl as createElement,
  createSvgUse,
} from '../../utils/element-utilities';
// import { useCustomerStore } from '../../store/customer-store';
import './about-style.scss';
import { gsap } from 'gsap';

enum TextKeys {
  ANSWER = 'answer',
  ANDRII = 'Andrii',
  VITALI = 'Vitali',
  SERGEY = 'Sergey',
  RSS = 'Rss',
}

type TextVal = { key: TextKeys; val: string };

export default function createAboutUsPage(container: HTMLElement): void {
  container.innerHTML = '';
  const big_text_container: TextVal[] = [
    {
      key: TextKeys.ANSWER,
      val: 'Our team works on equal terms, without strict hierarchy, We appreciate the contribution of each participant, We are building effective cooperation, Based on mutual respect and support!',
    },
    {
      key: TextKeys.ANDRII,
      val: 'Andreii is a Team Leader The role in the project: Organizing the work of the team, working with the commercetools API, making key technical decisions, coordinating development and timing control. Contribution: Andrey implemented the SPA architecture, organized the project assembly process using Vite, provided integration with commercetools, and tirelessly motivated the team to create the Bubble Tea Shop.Collaboration methods: Regular meetings, code review, and setting up CI/CD processes.Brief biography: An experienced developer specializing in TypeScript, js, a variety of libraries and a modern interface. You can also check out his GitHub page:',
    },
    {
      key: TextKeys.VITALI,
      val: 'Vitali is the senior developer of the project Vitali is responsible for the development of key modules, actively works with the commercetools API, writes tests and ensures high-quality code. His contributions include setting up linters (ESLint, Prettier), implementing Tailwind for styling, as well as writing and maintaining tests for Jest and TypeScript. Collaboration methods: Vitali actively participates in discussions, helps colleagues solve complex problems, maintains a unified code style and is the soul of the team. Brief biography: Specialist in layout and testing and working with commercetools. You can also check out his GitHub page:',
    },
    {
      key: TextKeys.SERGEY,
      val: 'Sergey is a user interface developer Sergey is responsible for the implementation of functionality, support and improvement of the user interface. His contributions include writing interface components, implementing a SPA, and participating in performance optimization. Collaboration methods: Sergey is actively involved in joint task planning, uses TypeScript and SCSS for development, and regularly participates in code review. Brief biography: Frontend is a developer who is passionate about modern technology and creating high-quality code. You can also check out his GitHub page:',
    },
    {
      key: TextKeys.RSS,
      val: "This project was created specifically for the R.S.School as part of one of the school's unique assignments, of which there are a lot. To whom are we grateful? Our team would like to thank all the mentors and mentors of the R.S.School for their efforts and support. What do we value at R.S.School? We would like to thank R.S.School for the excellent educational program, the tremendous amount of knowledge, the wonderful mentors and the unforgettable experience that we received. Where can I find out more? You can also view the courses offered by clicking on the link — just click on the name of the school",
    },
  ];

  function getTextByKey(key: TextKeys): string | undefined {
    const item = big_text_container.find((el) => el.key === key);
    return item?.val;
  }

  const profileContainer = createElement({
    tag: 'div',
    classes: [
      'about-page',
      'container',
      'mx-auto',
      'rounded-lg',
      'p-6',
      '-z-0',
      'relative',
      'bg-[linear-gradient(to_left,rgba(255,255,255,0.5)_0%,rgba(255,255,255,1)_15%,rgba(255,255,255,1)_85%,rgba(255,255,255,0.5)_100%)]',
      'min-[500px]:bg-[linear-gradient(to_left,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_25%,rgba(255,255,255,1)_75%,rgba(255,255,255,0)_100%)]',
    ],
    parent: container,
  });

  createElement({
    tag: 'h1',
    text: 'About Us',
    classes: [
      'text-3xl',
      'font-bold',
      'mb-6',
      'z-30',
      'text-center',
      'text-gray-800',
      "before:content-['']",
      'before:absolute',
      'before:h-6',
      'before:w-36',
      'before:bg-yellow-400',
      'before:-z-1',
      'login-name',
    ],
    parent: profileContainer,
  });

  const containerAbout = createElement({
    tag: 'div',
    classes: ['container-about'],
    parent: profileContainer,
  });

  const titleAbout = createElement({
    tag: 'h2',
    text: 'Developers Bubble Tea Shop',
    classes: ['title-about'],
  });
  containerAbout.append(titleAbout);

  const titleAboutUsh3 = createElement({
    tag: 'h3',
    classes: ['title-about-us-h3'],
    text: 'Frequently asked questions:',
  });
  containerAbout.append(titleAboutUsh3);

  const divAboutInfoCompanyContainer = createElement({
    tag: 'div',
    classes: ['about-info-company'],
  });
  containerAbout.append(divAboutInfoCompanyContainer);

  const prefaceContainer = createElement({
    tag: 'div',
    classes: ['preface-container-us'],
  });
  divAboutInfoCompanyContainer.append(prefaceContainer);

  const containerTextPreface = createElement({
    tag: 'div',
    classes: ['container-text-preface-us'],
  });
  prefaceContainer.append(containerTextPreface);

  const descriptionUl = createElement({
    tag: 'ul',
    classes: ['description-ul-us'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerTextPreface.append(descriptionUl);

  const containerMesegUser1 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-1', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  descriptionUl.append(containerMesegUser1);

  const titleUserh3 = createElement({
    tag: 'h3',
    text: 'User',
    classes: ['title-user-h3'],
  });
  containerMesegUser1.append(titleUserh3);

  const titleDescription = createElement({
    tag: 'li',
    classes: ['title-description-about'],
  });
  containerMesegUser1.append(titleDescription);

  const titleDescriptionPUser = createElement({
    tag: 'p',
    text: 'What is the general motto of your team?',
  });
  titleDescription.append(titleDescriptionPUser);

  const containerMesegUser2 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  descriptionUl.append(containerMesegUser2);

  const titleUser2h3 = createElement({
    tag: 'h3',
    text: 'Admin',
    classes: ['title-user2-h3'],
  });
  containerMesegUser2.append(titleUser2h3);

  const pointOne = createElement({
    tag: 'li',
    classes: ['point-us1'],
  });
  containerMesegUser2.append(pointOne);

  const titleDescriptionPUser2 = createElement({
    tag: 'p',
    text: getTextByKey(TextKeys.ANSWER),
  });
  pointOne.append(titleDescriptionPUser2);

  const technologiesTitleContainer = createElement({
    tag: 'div',
    classes: ['technologies-title-container-about'],
  });
  divAboutInfoCompanyContainer.append(technologiesTitleContainer);

  const containerTechnologiesText = createElement({
    tag: 'div',
    classes: ['container-technologies-text-andrei'],
  });
  technologiesTitleContainer.prepend(containerTechnologiesText);

  const containerInfoUsAndreiUl = createElement({
    tag: 'ul',
    classes: ['description-ul-us'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerTechnologiesText.append(containerInfoUsAndreiUl);

  const containerInfoUsAndreiUser1 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-1', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerInfoUsAndreiUl.append(containerInfoUsAndreiUser1);

  const technologiesTitleH3 = createElement({
    tag: 'h3',
    text: 'User',
    classes: ['technologies-Title-h3-us'],
  });
  containerInfoUsAndreiUser1.append(technologiesTitleH3);

  const titleMasegeAndreiUser1 = createElement({
    tag: 'li',
    classes: ['title-description-about'],
  });
  containerInfoUsAndreiUser1.append(titleMasegeAndreiUser1);

  const technologiesTitleP = createElement({
    tag: 'p',
    text: 'How many people do you have in your team?',
  });
  titleMasegeAndreiUser1.append(technologiesTitleP);

  const containerInfoUsAndreiUser2 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerInfoUsAndreiUl.append(containerInfoUsAndreiUser2);

  const h4Andrei = createElement({
    tag: 'h3',
    text: 'Admin',
    classes: ['title-user2-h3'],
  });
  containerInfoUsAndreiUser2.append(h4Andrei);

  const titleMasegeAndreiUser2 = createElement({
    tag: 'li',
    classes: ['point-us2'],
  });
  containerInfoUsAndreiUser2.append(titleMasegeAndreiUser2);

  const technologiesTitleP2 = createElement({
    tag: 'p',
    text: 'There are three people in the team and everyone has their own role:',
  });
  titleMasegeAndreiUser2.append(technologiesTitleP2);

  const containerInfoUsAndreiUser22 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerInfoUsAndreiUl.append(containerInfoUsAndreiUser22);

  const titleMasegeAndreiUser3 = createElement({
    tag: 'li',
    classes: ['point-us1'],
  });
  containerInfoUsAndreiUser22.append(titleMasegeAndreiUser3);

  const technologiesTitleP3 = createElement({
    tag: 'p',
    text: getTextByKey(TextKeys.ANDRII),
  });
  titleMasegeAndreiUser3.append(technologiesTitleP3);

  const containerInfoUsAndreiUser222 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerInfoUsAndreiUl.append(containerInfoUsAndreiUser222);

  const titleMasegeAndreiUser4 = createElement({
    tag: 'li',
    classes: ['point-us2'],
  });
  containerInfoUsAndreiUser222.append(titleMasegeAndreiUser4);

  const containerImgTechnologies = createElement({
    tag: 'div',
    classes: ['container-img-technologies-andrei'],
  });
  titleMasegeAndreiUser4.append(containerImgTechnologies);

  const svgGithubAndrei = createSvgUse('#github', 'about-svg_githubAnd');

  containerImgTechnologies.append(svgGithubAndrei);

  const footerLinkGithubAndrei = createElement({
    tag: 'a',
    classes: ['about-link-andrei'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/grenst',
    },
    text: 'Andrei GitHub Page',
  });
  containerImgTechnologies.append(footerLinkGithubAndrei);

  //----------------------------------------------------

  const technologiesTitleContainerVit = createElement({
    tag: 'div',
    classes: ['technologies-title-container-about'],
  });
  divAboutInfoCompanyContainer.append(technologiesTitleContainerVit);

  const containerVitaliTitle = createElement({
    tag: 'div',
    classes: ['container-vitali-Title'],
  });
  technologiesTitleContainerVit.append(containerVitaliTitle);

  const containerUlVitali = createElement({
    tag: 'ul',
    classes: ['container-ul-vitali'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerVitaliTitle.append(containerUlVitali);

  const containerTechnologiesTextVit = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerUlVitali.append(containerTechnologiesTextVit);

  const h4Vit = createElement({
    tag: 'h3',
    text: 'Admin',
    classes: ['title-user2-h3'],
  });
  containerTechnologiesTextVit.append(h4Vit);

  const technologiesTitleLiVit = createElement({
    tag: 'li',
    classes: ['point-us'],
  });
  containerTechnologiesTextVit.append(technologiesTitleLiVit);

  const technologiesTitleP2Vit = createElement({
    tag: 'p',
    text: 'Second team member:',
  });
  technologiesTitleLiVit.append(technologiesTitleP2Vit);

  const containerTechnologiesTextVit1 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerUlVitali.append(containerTechnologiesTextVit1);

  const technologiesTitleP3Vit = createElement({
    tag: 'li',
    classes: ['point-us1'],
  });
  containerTechnologiesTextVit1.append(technologiesTitleP3Vit);

  const technologiesTitleVit = createElement({
    tag: 'p',
    text: getTextByKey(TextKeys.VITALI),
  });
  technologiesTitleP3Vit.append(technologiesTitleVit);

  const containerTechnologiesTextVit11 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerUlVitali.append(containerTechnologiesTextVit11);

  const containerImgTechnologiesVit = createElement({
    tag: 'li',
    classes: ['container-img-technologies-vitali', 'point-us2'],
  });
  containerTechnologiesTextVit11.append(containerImgTechnologiesVit);

  const svgGithubVitaly = createSvgUse('#github', 'about-svg_githubVet');
  containerImgTechnologiesVit.prepend(svgGithubVitaly);

  const footerLinkGithubVitaly = createElement({
    tag: 'a',
    classes: ['about-link-vitali'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/VitaliMay',
    },
    text: 'Vitali GitHub Page',
  });
  containerImgTechnologiesVit.append(footerLinkGithubVitaly);

  //--------------------------------------------------------------------

  const technologiesTitleContainerSer = createElement({
    tag: 'div',
    classes: ['technologies-title-container-about'],
  });
  divAboutInfoCompanyContainer.append(technologiesTitleContainerSer);

  const containerAboutSer = createElement({
    tag: 'div',
    classes: ['container-about-ser'],
  });
  technologiesTitleContainerSer.append(containerAboutSer);

  const containerUlser = createElement({
    tag: 'ul',
    classes: ['container-ul-ser'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerAboutSer.append(containerUlser);

  const containerTechnologiesTextSer = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerUlser.prepend(containerTechnologiesTextSer);

  const h4ASergei = createElement({
    tag: 'h3',
    text: 'Admin',
    classes: ['title-user2-h3'],
  });
  containerTechnologiesTextSer.append(h4ASergei);

  const technologiesTitlePSer = createElement({
    tag: 'li',
    classes: ['point-us2'],
  });
  containerTechnologiesTextSer.append(technologiesTitlePSer);

  const technologiesTitleP2Ser = createElement({
    tag: 'p',
    text: 'And the third of the developers:',
  });
  technologiesTitlePSer.append(technologiesTitleP2Ser);

  const containerTechnologiesTextSer1 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerUlser.append(containerTechnologiesTextSer1);

  const technologiesTitleP3Ser = createElement({
    tag: 'li',
    classes: ['point-us1'],
  });
  containerTechnologiesTextSer1.append(technologiesTitleP3Ser);

  const technologiesTitleP4Ser = createElement({
    tag: 'p',
    text: getTextByKey(TextKeys.SERGEY),
  });
  technologiesTitleP3Ser.append(technologiesTitleP4Ser);

  const containerTechnologiesTextSer11 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerUlser.append(containerTechnologiesTextSer11);

  const containerImgTechnologiesSer = createElement({
    tag: 'li',
    classes: ['container-img-technologies-sergei', 'point-us2'],
  });
  containerTechnologiesTextSer11.append(containerImgTechnologiesSer);

  const svgGithubSergei = createSvgUse('#github', 'about-svg_githubSer');
  containerImgTechnologiesSer.append(svgGithubSergei);

  const footerLinkGithubSergei = createElement({
    tag: 'a',
    classes: ['sergei-link'],
    attributes: {
      target: '_blank',
      href: 'https://github.com/SeregaSimba',
    },
    text: 'Sergei GitHub Page',
  });
  containerImgTechnologiesSer.append(footerLinkGithubSergei);

  //----------------------------------------------------------------

  const containerHistory = createElement({
    tag: 'div',
    classes: ['container-history'],
  });
  divAboutInfoCompanyContainer.append(containerHistory);

  const containerRSSAbout = createElement({
    tag: 'div',
    classes: ['container-rss-about'],
  });
  containerHistory.append(containerRSSAbout);

  const containerULRss = createElement({
    tag: 'ul',
    classes: ['container-ul-rss'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerRSSAbout.append(containerULRss);

  const containeriRss = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-1', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerULRss.append(containeriRss);

  const historyCreation = createElement({
    tag: 'h3',
    text: 'User',
    classes: ['title-user-h3'],
  });
  containeriRss.append(historyCreation);

  const historyTextLi = createElement({
    tag: 'li',
    classes: ['title-description-about'],
  });
  containeriRss.append(historyTextLi);

  const textPRss = createElement({
    tag: 'p',
    text: 'Why did you decide to do this project?',
  });
  historyTextLi.append(textPRss);

  const userRssUl = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerRSSAbout.append(userRssUl);

  const titleRssH3 = createElement({
    tag: 'h3',
    text: 'Admin',
    classes: ['title-user2-h3'],
  });
  userRssUl.append(titleRssH3);

  const userRssli = createElement({
    tag: 'li',
    classes: ['point-us1'],
  });
  userRssUl.append(userRssli);

  const textPRss2 = createElement({
    tag: 'p',
    text: getTextByKey(TextKeys.RSS),
  });
  userRssli.append(textPRss2);

  const userRssUl1 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerRSSAbout.append(userRssUl1);

  const containerImgFooter = createElement({
    tag: 'li',
    classes: ['container-img-footer', 'point-us2'],
  });
  userRssUl1.append(containerImgFooter);

  const linkRss = createElement({
    tag: 'a',
    classes: ['link-rss-about'],
    attributes: {
      target: '_blank',
      href: 'https://rs.school/courses/javascript-ru',
    },
  });
  containerImgFooter.append(linkRss);
  const svgRSS = createSvgUse('#rss', 'about-svg_rss');
  linkRss.append(svgRSS);

  const revealOrder: { el: HTMLElement, time: number }[] = [
    { el: containerMesegUser1!, time: 1 },
    { el: containerMesegUser2!, time: 3 },
    { el: containerInfoUsAndreiUser1!, time: 6 },
    { el: containerInfoUsAndreiUser2!, time: 9 },
    { el: containerInfoUsAndreiUser22!, time: 12 },
    { el: containerInfoUsAndreiUser222!, time: 15 },
    { el: containerTechnologiesTextVit!, time: 18 },
    { el: containerTechnologiesTextVit1!, time: 21 },
    { el: containerTechnologiesTextVit11!, time: 24 },
    { el: containerTechnologiesTextSer!, time: 27 },
    { el: containerTechnologiesTextSer1!, time: 30 },
    { el: containerTechnologiesTextSer11!, time: 33 },
    { el: containeriRss!, time: 36 },
    { el: userRssUl!, time: 39 },
    { el: userRssUl1!, time: 42 },
  ];

  gsap.set(
    revealOrder.map((item) => item.el),
    {
      autoAlpha: 0,
      x: (_index, el: HTMLElement) =>
        el.classList.contains('container-meseg-user-1') ? -100 : 100,
    }
  );

  const tl = gsap.timeline({
    defaults: {
      duration: 0.8,
      ease: 'power1.out',
    },
  });

  revealOrder.forEach(({ el, time }) => {
    tl.to(
      el,
      {
        duration: 2.5,
        autoAlpha: 1,
        x: 0,
        ease: 'power1.out',
      },
      time
    );
  });
}

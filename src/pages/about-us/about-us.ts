import {
  createEl as createElement,
  createSvgUse,
} from '../../utils/element-utilities';
import andrImage from '../../assets/images/andr.webp';
import vitImage from '../../assets/images/vit.webp';
import sergImage from '../../assets/images/serg.webp';
import rsImage from '../../assets/images/rs.webp';
import './about-style.scss';
import { gsap } from 'gsap';

type LinkItem = {
  label: string;
  url: string;
};

const linksData: Record<string, LinkItem[]> = {
  Andrii: [{ label: 'Andrii GitHub Page', url: 'https://github.com/grenst' }],
  Vitali: [
    { label: 'Vitali GitHub Page', url: 'https://github.com/VitaliMay' },
  ],
  Sergey: [
    { label: 'Sergei GitHub Page', url: 'https://github.com/SeregaSimba' },
  ],
  Rss: [
    {
      label: 'RSSchool Courses',
      url: 'https://rs.school/courses/javascript-ru',
    },
  ],
};

type TextValue = { key: TextKeys; val: string };

enum TextKeys {
  // ANSWER = 'answer',
  ANDRII = 'Andrii',
  VITALI = 'Vitali',
  SERGEY = 'Sergey',
  RSS = 'Rss',
  ANSWER = 'ANSWER',
}

export default function createAboutUsPage(container: HTMLElement): void {
  container.innerHTML = '';
  const big_text_container: TextValue[] = [
    {
      key: TextKeys.ANSWER,
      val: 'Our team works on equal terms, without strict hierarchy, We appreciate the contribution of each participant, We are building effective cooperation, Based on mutual respect and support!',
    },
    {
      key: TextKeys.ANDRII,
      val: 'Andrii is a Team Leader The role in the project: Organizing the work of the team, working with the commercetools API, making key technical decisions, coordinating development and timing control. Contribution: Andrii implemented the SPA architecture, organized the project assembly process using Vite, provided integration with commercetools, and tirelessly motivated the team to create the Bubble Tea Shop.Collaboration methods: Regular meetings, code review, and setting up CI/CD processes.Brief biography: An experienced developer specializing in TypeScript, js, a variety of libraries and a modern interface. You can also check out his GitHub page:',
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

  function getTextByKey(key: TextKeys): string {
    const item = big_text_container.find((element) => element.key === key);
    return item?.val ?? '';
  }

  function isTextKey(value: string | TextKeys): value is TextKeys {
    return Object.values(TextKeys).includes(value as TextKeys);
  }

  function createMessageBlock(
    parent: HTMLElement,
    type: 'user' | 'admin',
    content: string | TextKeys,
    classes: string[] = []
  ): HTMLElement {
    const typeConfig = {
      user: {
        containerClass: 'container-meseg-user-1',
        titleClass: 'title-user-h3',
        liClass: 'title-description-about',
        titleText: 'Question',
      },
      admin: {
        containerClass: 'container-meseg-user-2',
        titleClass: 'title-user2-h3',
        liClass: 'point-us1',
        titleText: 'Answer',
      },
    }[type];

    const container = createElement({
      tag: 'ul',
      classes: [typeConfig.containerClass, 'hidden1', ...classes],
      attributes: { style: 'will-change: transform, opacity;' },
      parent,
    });

    createElement({
      tag: 'h3',
      text: typeConfig.titleText,
      classes: [typeConfig.titleClass],
      parent: container,
    });

    const contentElement = createElement({
      tag: 'li',
      classes: [typeConfig.liClass],
      parent: container,
    });

    const text = isTextKey(content) ? getTextByKey(content) : content;
    createElement({ tag: 'p', text, parent: contentElement });

    return container;
  }

  function createLinkBlock(
    key: string,
    iconId: string,
    svgClass: string
  ): HTMLElement {
    const links = linksData[key] || [];
    const container = createElement({
      tag: 'div',
      classes: ['link-container'],
    });

    const svg = createSvgUse(`#${iconId}`, svgClass);
    container.append(svg);

    for (const link of links) {
      createElement({
        tag: 'a',
        classes: ['custom-link-class'],
        attributes: {
          target: '_blank',
          href: link.url,
          'aria-label': link.label,
        },
        text: link.label,
        parent: container,
      });
    }

    return container;
  }

  function createMemberInfo(
    parent: HTMLElement,
    src: string,
    alt: string,
    key: TextKeys
  ): void {
    const ul = createElement({
      tag: 'ul',
      parent,
      classes: ['container-meseg-user-2', 'hidden1'],
      attributes: { style: 'will-change: transform, opacity;' },
    });

    const li = createElement({
      tag: 'li',
      parent: ul,
      classes: ['point-us1'],
    });

    createElement({
      tag: 'img',
      parent: li,
      attributes: {
        src,
        alt,
        style: 'max-width: 200px; max-height: 200px; margin-bottom: 10px; border-radius: 20px;',
      },
    });

    createElement({
      tag: 'p',
      parent: li,
      text: getTextByKey(key),
    });
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
    text: 'Developers of Bubble Tea Shop',
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

  createMessageBlock(
    descriptionUl,
    'user',
    'What is the general motto of your team?'
  );
  createMessageBlock(descriptionUl, 'admin', TextKeys.ANSWER);

  const technologiesTitleContainer = createElement({
    tag: 'div',
    classes: ['technologies-title-container-about'],
  });
  divAboutInfoCompanyContainer.append(technologiesTitleContainer);

  const containerTechnologiesText = createElement({
    tag: 'div',
    classes: ['container-technologies-text-ii'],
  });
  technologiesTitleContainer.prepend(containerTechnologiesText);

  const containerInfoUsAndriiUl = createElement({
    tag: 'ul',
    classes: ['description-ul-us'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerTechnologiesText.append(containerInfoUsAndriiUl);

  createMessageBlock(
    containerInfoUsAndriiUl,
    'user',
    'How many people do you have in your team?'
  );
  createMessageBlock(
    containerInfoUsAndriiUl,
    'admin',
    'There are three people in the team and everyone has their own role:'
  );

  const containerInfoUsAndriiUser22 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerInfoUsAndriiUl.append(containerInfoUsAndriiUser22);

  const titleMasegeAndriiUser3 = createElement({
    tag: 'li',
    classes: ['point-us1'],
  });
  containerInfoUsAndriiUser22.append(titleMasegeAndriiUser3);

  const andriiImg = createElement({
    tag: 'img',
    attributes: {
      src: andrImage,
      alt: 'Andrii',
      style: 'max-width: 200px; max-height: 200px; margin-bottom: 10px; border-radius: 30px;',
    },
  });
  titleMasegeAndriiUser3.append(andriiImg);

  const technologiesTitleP3 = createElement({
    tag: 'p',
    text: getTextByKey(TextKeys.ANDRII),
  });
  titleMasegeAndriiUser3.append(technologiesTitleP3);

  const containerInfoUsAndriiUser222 = createElement({
    tag: 'ul',
    classes: ['container-meseg-user-2', 'hidden1'],
    attributes: {
      style: 'will-change: transform, opacity;',
    },
  });
  containerInfoUsAndriiUl.append(containerInfoUsAndriiUser222);

  const titleMasegeAndriiUser4 = createElement({
    tag: 'li',
    classes: ['point-us2'],
  });
  containerInfoUsAndriiUser222.append(titleMasegeAndriiUser4);

  const containerImgTechnologies = createElement({
    tag: 'div',
    classes: ['container-img-andrii'],
  });
  titleMasegeAndriiUser4.append(containerImgTechnologies);

  containerImgTechnologies.append(
    createLinkBlock('Andrii', 'github', 'about-svg_githubAnd')
  );

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

  createMessageBlock(containerUlVitali, 'admin', 'Second team member:');
  createMemberInfo(containerUlVitali, vitImage, 'Vitali', TextKeys.VITALI);

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

  containerImgTechnologiesVit.append(
    createLinkBlock('Vitali', 'github', 'about-svg_githubVet')
  );

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

  createMessageBlock(containerUlser, 'admin', 'And the third of the developers:');
  createMemberInfo(containerUlser, sergImage, 'Sergey', TextKeys.SERGEY);

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

  containerImgTechnologiesSer.append(
    createLinkBlock('Sergey', 'github', 'about-svg_githubSer')
  );

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

  const rssImg = createElement({
    tag: 'img',
    attributes: {
      src: rsImage,
      alt: 'RSS',
      style: 'max-width: 200px; max-height: 200px; margin-bottom: 10px;',
    },
  });
  userRssli.append(rssImg);

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

  containerImgFooter.append(createLinkBlock('Rss', 'rss', 'about-svg_rss'));

  // Set initial hidden state for all animated elements
  gsap.set('.hidden1', { autoAlpha: 0, y: 40 });

  // Create Intersection Observer for lazy-loading animations
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          gsap.fromTo(
            entry.target,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.6 }
          );
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1 }
  );

  // Observe all hidden elements
  const hiddenBlocks = document.querySelectorAll('.hidden1');
  for (const block of hiddenBlocks) {
    io.observe(block);
  }
}

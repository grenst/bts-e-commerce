import { createEl as createElement } from '../../utils/element-utilities';
// import { useCustomerStore } from '../../store/customer-store';
import './about-style.scss';
import aboutImg1 from '@assets/images/about-1.webp';
import aboutImg2 from '@assets/images/about-2.webp';
// import aboutImg3 from '@assets/images/about-3.webp';
import aboutImg3 from '@assets/images/honey-vulkan.png';

export default function createAboutInfoPage(container: HTMLElement): void {
  container.innerHTML = '';

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
    text: 'About the Company',
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
      'before:w-75',
      'before:bg-yellow-400',
      'before:-z-1',
      'login-name',
    ],
    parent: profileContainer,
  });

  //   const { customer } = useCustomerStore.getState();

  //   if (!customer) {
  //     createElement({
  //       tag: 'p',
  //       text: 'Please log in to view your profile.',
  //       classes: ['text-gray-600', 'text-center'],
  //       parent: profileContainer,
  //     });
  //     return;
  // };

  const containerAbout = createElement({
    tag: 'div',
    classes: ['container-about'],
    parent: profileContainer,
  });

  const titleAbout = createElement({
    tag: 'h2',
    text: 'Bubble Tea Shop',
    classes: ['title-about'],
  });
  containerAbout.append(titleAbout);

  const pIntroduction = createElement({
    tag: 'p',
    text: 'Create your perfect Bubble Tea 🧋 online!',
    classes: ['p-introduction'],
  });
  containerAbout.append(pIntroduction);

  const divAboutInfoCompanyContainer = createElement({
    tag: 'div',
    classes: ['about-info-company'],
  });
  containerAbout.append(divAboutInfoCompanyContainer);

  const prefaceContainer = createElement({
    tag: 'div',
    classes: ['preface-container'],
  });
  divAboutInfoCompanyContainer.append(prefaceContainer);

  const containerTextPreface = createElement({
    tag: 'div',
    classes: ['container-text-preface'],
  });
  prefaceContainer.append(containerTextPreface);

  const prefaceH3 = createElement({
    tag: 'h3',
    text: 'With Bubble Tea Shop, choose the type of tea, milk, syrups, toppings, sweetness level and temperature - and get a unique drink created by you! Try it right now and feel the taste of real creativity in every sip!',
    classes: ['preface-h3'],
  });
  containerTextPreface.append(prefaceH3);

  const descriptionUl = createElement({
    tag: 'ul',
    classes: ['description-ul'],
  });
  containerTextPreface.append(descriptionUl);

  const titleDescription = createElement({
    tag: 'h3',
    text: 'Main features',
    classes: ['title-description'],
  });
  descriptionUl.append(titleDescription);

  const containerImgPreface = createElement({
    tag: 'div',
    classes: ['container-img-preface'],
  });
  prefaceContainer.append(containerImgPreface);

  const ImgPreface = createElement({
    tag: 'img',
    classes: ['ImgPreface'],
    attributes: {
      src: aboutImg1,
    },
  });
  containerImgPreface.append(ImgPreface);

  const pointOne = createElement({
    tag: 'li',
    text: 'Feel the pleasure of creating a drink that fully suits your taste and mood. Flexibly customize ingredients to create a unique recipe.',
    classes: ['point'],
  });
  descriptionUl.append(pointOne);

  const pointTwo = createElement({
    tag: 'li',
    text: 'Diversify your routine with new tastes and surprise your colleagues.',
    classes: ['point'],
  });
  descriptionUl.append(pointTwo);

  const pointThree = createElement({
    tag: 'li',
    text: 'Immerse yourself in the world of vibrant flavors and aromas from the comfort of your home or office.',
    classes: ['point'],
  });
  descriptionUl.append(pointThree);

  const pointFour = createElement({
    tag: 'li',
    text: 'Easily order and receive fresh drinks with delivery right to your doorstep.',
    classes: ['point'],
  });
  descriptionUl.append(pointFour);

  const pointFive = createElement({
    tag: 'li',
    text: 'Ideal for those who appreciate quality, diversity and individualism.',
    classes: ['point'],
  });
  descriptionUl.append(pointFive);

  const technologiesTitleContainer = createElement({
    tag: 'div',
    classes: ['technologies-title-container'],
  });
  divAboutInfoCompanyContainer.append(technologiesTitleContainer);

  const containerTechnologiesText = createElement({
    tag: 'div',
    classes: ['container-technologies-text'],
  });
  technologiesTitleContainer.append(containerTechnologiesText);

  const technologiesTitleH3 = createElement({
    tag: 'h3',
    text: 'Simplicity and Uniqueness',
    classes: ['technologies-Title-h3'],
  });
  containerTechnologiesText.append(technologiesTitleH3);

  const technologiesTitleP = createElement({
    tag: 'p',
    text: 'In this project, we present a unique application that gives each user the opportunity to turn their taste preferences in drinks into reality. Create your own unique recipes, discover new flavors and share them with colleagues and friends. Experiment without limits, break the boundaries of imagination and fill the world with bright colors with the Bubble Tea Store! - Create your perfect drink today!',
    classes: ['technologies-title-p'],
  });
  containerTechnologiesText.append(technologiesTitleP);

  const containerImgTechnologies = createElement({
    tag: 'div',
    classes: ['container-img-technologies'],
  });
  technologiesTitleContainer.prepend(containerImgTechnologies);

  const imgTechnologies = createElement({
    tag: 'img',
    classes: ['img-technologies'],
    attributes: {
      src: aboutImg2,
    },
  });
  containerImgTechnologies.append(imgTechnologies);

  const objectivesProjectTitleContainer = createElement({
    tag: 'div',
    classes: ['objectives-project-title-container'],
  });
  divAboutInfoCompanyContainer.append(objectivesProjectTitleContainer);

  const objectivesProjectTitleUl = createElement({
    tag: 'ul',
    classes: ['objectives-project-title-ul'],
  });
  objectivesProjectTitleContainer.append(objectivesProjectTitleUl);

  const titleObjectives = createElement({
    tag: 'h3',
    text: 'Project objectives',
    classes: ['title-objectives'],
  });
  objectivesProjectTitleUl.append(titleObjectives);

  const objectivesProjectTitleOne = createElement({
    tag: 'li',
    text: 'Help users create drinks based on their taste preferences.',
    classes: ['objectives-project-title'],
  });
  objectivesProjectTitleUl.append(objectivesProjectTitleOne);

  const objectivesProjectTitleTwo = createElement({
    tag: 'li',
    text: 'Manage the order time according to your schedule - quickly, conveniently, and without waiting in line.',
    classes: ['objectives-project-title'],
  });
  objectivesProjectTitleUl.append(objectivesProjectTitleTwo);

  const objectivesProjectTitleThree = createElement({
    tag: 'li',
    text: 'Avoid stress and fuss while enjoying a comfortable and fast service.',
    classes: ['objectives-project-title'],
  });
  objectivesProjectTitleUl.append(objectivesProjectTitleThree);

  const containerHistory = createElement({
    tag: 'div',
    classes: ['container-history'],
  });
  divAboutInfoCompanyContainer.append(containerHistory);

  const historyCreation = createElement({
    tag: 'h3',
    text: 'history of creation',
    classes: ['history-creation'],
  });
  containerHistory.append(historyCreation);

  const historyTextP = createElement({
    tag: 'p',
    text: 'There will be a history of the creation of the application, which we were inspired by.',
    classes: ['history-text-p'],
  });
  containerHistory.append(historyTextP);

  const containerImgFooter = createElement({
    tag: 'div',
    classes: ['container-img-footer'],
  });
  containerHistory.append(containerImgFooter);

  const imgFooter = createElement({
    tag: 'img',
    classes: ['img-Footer'],
    attributes: {
      src: aboutImg3,
    },
  });
  containerImgFooter.append(imgFooter);
}
// сдеать футер поменть имена сделат ссылку на дискорд и сделать даптивным решить вопрос с зоной соприкосновения ссылок

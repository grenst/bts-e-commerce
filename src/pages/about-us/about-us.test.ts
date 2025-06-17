import createAboutUsPage from './about-us';
import {
  createEl as createElement,
  createSvgUse,
} from '../../utils/element-utilities';

interface MockHTMLElement {
  tagName: string;
  textContent: string;
  className: string;
  attributes: Record<string, string>;
  children: MockHTMLElement[];
  append: jest.Mock<void, (MockHTMLElement | string)[]>;
  prepend: jest.Mock<void, (MockHTMLElement | string)[]>;
  innerHTML: string;
  _innerHTML: string; // Add this line
  style: Record<string, string>;
  classList: {
    contains: jest.Mock<boolean, [string]>;
  };
}

// Mock element-utilities to prevent actual DOM manipulation and capture calls
jest.mock('../../utils/element-utilities', () => ({
  createEl: jest.fn(
    (options: {
      tag?: string;
      text?: string;
      classes?: string[];
      attributes?: Record<string, string>;
      parent?: MockHTMLElement;
    }) => {
      const mockElement: MockHTMLElement = {
        tagName: options.tag ? options.tag.toUpperCase() : 'DIV',
        textContent: options.text || '',
        className: options.classes ? options.classes.join(' ') : '',
        attributes: options.attributes || {},
        children: [],
        append: jest.fn(function (
          this: MockHTMLElement,
          ...nodes: Array<MockHTMLElement | string>
        ) {
          for (const node of nodes) {
            if (typeof node === 'string') {
              this.textContent += node;
            } else {
              this.children.push(node);
            }
          }
        }),
        prepend: jest.fn(function (
          this: MockHTMLElement,
          ...nodes: Array<MockHTMLElement | string>
        ) {
          for (const node of nodes) {
            if (typeof node === 'string') {
              this.textContent = node + this.textContent;
            } else {
              this.children.unshift(node);
            }
          }
        }),
        _innerHTML: '', // Use a private property to store the actual innerHTML value
        get innerHTML() {
          return this._innerHTML;
        },
        set innerHTML(value: string) {
          this._innerHTML = value;
          this.children = []; // Clear children when innerHTML is set
          this.textContent = value; // Set textContent as well
        },
        style: {},
        classList: {
          contains: jest.fn((cls: string) =>
            (options.classes || []).includes(cls)
          ),
        },
      };
      if (options.parent) {
        options.parent.append(mockElement);
      }
      return mockElement;
    }
  ) as jest.Mock<MockHTMLElement, any[]>,
  createSvgUse: jest.fn((href: string, classes?: string) => {
    const mockSvg = {
      tagName: 'svg',
      href,
      className: classes || '',
    };
    return mockSvg;
  }),
}));

// Mock GSAP to prevent it from interacting with the DOM
jest.mock('gsap', () => ({
  gsap: {
    set: jest.fn(),
    to: jest.fn(),
    timeline: jest.fn(() => ({
      to: jest.fn(),
      from: jest.fn(),
      add: jest.fn(),
    })),
  },
}));

describe('createAboutUsPage', () => {
  let container: MockHTMLElement;

  beforeEach(() => {
    container = createElement({ tag: 'div' }) as unknown as MockHTMLElement; // Create a mock element for the container
    (createElement as jest.Mock).mockClear();
    (createSvgUse as jest.Mock).mockClear();
  });

  it('should clear the container innerHTML on initialization', () => {
    container.innerHTML = 'some existing content';
    createAboutUsPage(container as unknown as HTMLElement);
    expect(container.innerHTML).toBe('');
  });

  it('should create the main profile container', () => {
    createAboutUsPage(container as unknown as HTMLElement);
    expect(createElement).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'div',
        classes: expect.arrayContaining(['about-page', 'container']),
        parent: container,
      })
    );
  });

  it('should create the "About Us" title', () => {
    createAboutUsPage(container as unknown as HTMLElement);
    expect(createElement).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'h1',
        text: 'About Us',
        classes: expect.arrayContaining(['text-3xl', 'font-bold']),
      })
    );
  });

  it('should display the general team motto', () => {
    createAboutUsPage(container as unknown as HTMLElement);
    expect(createElement).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'p',
        text: expect.stringContaining('Our team works on equal terms'),
      })
    );
  });

  it('should display information for Andrii including GitHub link', () => {
    createAboutUsPage(container as unknown as HTMLElement);
    expect(createElement).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'p',
        text: expect.stringContaining('Andreii is a Team Leader'),
      })
    );
    expect(createElement).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'a',
        attributes: expect.objectContaining({
          href: 'https://github.com/grenst',
          target: '_blank',
        }),
        text: 'Andrei GitHub Page',
      })
    );
    expect(createSvgUse).toHaveBeenCalledWith('#github', 'about-svg_githubAnd');
  });

  it('should display information for Vitali including GitHub link', () => {
    createAboutUsPage(container as unknown as HTMLElement);
    expect(createElement).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'p',
        text: expect.stringContaining(
          'Vitali is the senior developer of the project'
        ),
      })
    );
    expect(createElement).toHaveBeenCalledWith(
      expect.objectContaining({
        tag: 'a',
        attributes: expect.objectContaining({
          href: 'https://github.com/VitaliMay',
          target: '_blank',
        }),
        text: 'Vitali GitHub Page',
      })
    );
    expect(createSvgUse).toHaveBeenCalledWith('#github', 'about-svg_githubVet');
  });

  it('should display information for Sergey including GitHub link', () => {
    createAboutUsPage(container as unknown as HTMLElement);
    console.log(
      'createElement.mock.calls:',
      (createElement as jest.Mock).mock.calls
    );

    const sergeyTextElement = (createElement as jest.Mock).mock.calls.find(
      (call: [object]) =>
        (call[0] as { text?: string }).text?.includes(
          'Sergey is a user interface developer'
        )
    );
    expect(sergeyTextElement).toBeDefined();

    const sergeyLinkElement = (createElement as jest.Mock).mock.calls.find(
      (call: [object]) =>
        (call[0] as { attributes?: { href?: string } }).attributes?.href ===
        'https://github.com/Sergey-Kozlov-RS'
    );
    expect(sergeyLinkElement).toBeDefined();
    expect((sergeyLinkElement[0] as { text: string }).text).toBe(
      'Sergey GitHub Page'
    ); // Corrected typo

    expect(createSvgUse).toHaveBeenCalledWith('#github', 'about-svg_githubSer');
  });

  it('should display RS School information and link', () => {
    createAboutUsPage(container as unknown as HTMLElement);

    const rssTextElement = (createElement as jest.Mock).mock.calls.find(
      (call: [object]) =>
        (call[0] as { text?: string }).text?.includes(
          'This project was created specifically for the R.S.School'
        )
    );
    expect(rssTextElement).toBeDefined();

    const rssLinkElement = (createElement as jest.Mock).mock.calls.find(
      (call: [object]) =>
        (call[0] as { attributes?: { href?: string } }).attributes?.href ===
        'https://rs.school/'
    );
    expect(rssLinkElement).toBeDefined();
    // Removed the text assertion as it's not part of createElement options for this element
    // expect((rssLinkElement[0] as { text: string }).text).toBe('RS School');

    expect(createSvgUse).toHaveBeenCalledWith('#rsschool', 'about-svg_rss');
  });
});

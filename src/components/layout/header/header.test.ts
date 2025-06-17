import { createHeaderElements, updateUserNavOnHeader } from './header';
import {
  body,
  createEl as createElement,
  createSvgUse,
  removeAllChild,
} from '../../../utils/element-utilities';
import { useTokenStore } from '../../../store/token-store';
import { useCustomerStore } from '../../../store/customer-store';
import { Router } from '../../../router/router';
import { createUserDropdown } from '../user-menu';
import { gsap } from '../../../animations/gsap-init';

// Mock gsap
jest.mock('../../../animations/gsap-init', () => ({
  gsap: {
    from: jest.fn(),
  },
}));

const createdElements: HTMLElement[] = [];
const createdSvgUses: SVGElement[] = [];

// Mock element-utilities
jest.mock('../../../utils/element-utilities', () => ({
  body: {
    append: jest.fn(),
  },
  createEl: jest.fn((options) => {
    const mockElement = document.createElement(options.tag || 'div');
    const eventListeners: { [key: string]: EventListener[] } = {};

    mockElement.addEventListener = jest.fn((event, callback) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(callback as EventListener);
    });

    mockElement.click = () => {
      if (eventListeners['click']) {
        for (const callback of eventListeners['click']) {
          callback(new MouseEvent('click'));
        }
      }
    };

    if (options.text) {
      mockElement.textContent = options.text;
    }
    if (options.attributes) {
      for (const key in options.attributes) {
        mockElement.setAttribute(key, options.attributes[key]);
      }
    }
    if (options.classes) {
      mockElement.classList.add(...options.classes);
    }
    if (options.parent && options.parent.append) {
      options.parent.append(mockElement);
    }
    createdElements.push(mockElement);
    return mockElement;
  }),
  createSvgUse: jest.fn((href, className) => {
    const mockSvg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    const mockUse = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'use'
    );
    mockUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
    mockSvg.append(mockUse);
    if (className) {
      mockSvg.classList.add(className);
    }

    const eventListeners: { [key: string]: EventListener[] } = {};
    mockSvg.addEventListener = jest.fn((event, callback) => {
      if (!eventListeners[event]) {
        eventListeners[event] = [];
      }
      eventListeners[event].push(callback as EventListener);
    });

    (mockSvg as any).click = () => {
      if (eventListeners['click']) {
        for (const callback of eventListeners['click']) {
          callback(new MouseEvent('click'));
        }
      }
    };
    createdSvgUses.push(mockSvg);
    return mockSvg;
  }),
  removeAllChild: jest.fn((element) => {
    while (element.firstChild) {
      element.firstChild.remove();
    }
  }),
}));

// Mock stores
jest.mock('../../../store/token-store', () => ({
  useTokenStore: {
    getState: jest.fn(),
  },
}));

jest.mock('../../../store/customer-store', () => ({
  useCustomerStore: {
    getState: jest.fn(),
  },
}));

// Mock router
const mockNavigateTo = jest.fn();
jest.mock('../../../router/router', () => ({
  Router: jest.fn(() => ({
    navigateTo: mockNavigateTo,
  })),
}));

// Mock user-menu
jest.mock('../user-menu', () => ({
  createUserDropdown: jest.fn(),
}));

describe('Header Module', () => {
  let mockRouter: Router;
  let mockUserNav: HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = new Router(document.createElement('div'));
    mockUserNav = document.createElement('div');
    createdElements.length = 0; // Clear the array
    createdSvgUses.length = 0; // Clear the array
  });

  describe('updateUserNavOnHeader', () => {
    beforeEach(() => {
      // Clear mockUserNav before each test to ensure a clean state
      removeAllChild(mockUserNav);
      // Reset mockNavigateTo before each test
      mockNavigateTo.mockClear();
    });

    test('should display login link when user is not logged in', () => {
      // Arrange
      (useTokenStore.getState as jest.Mock).mockReturnValue({
        accessToken: undefined,
      });
      (useCustomerStore.getState as jest.Mock).mockReturnValue({
        customer: undefined,
      });

      // Act
      updateUserNavOnHeader(mockUserNav, mockRouter);

      // Assert
      expect(createElement).toHaveBeenCalledWith({
        tag: 'a',
        text: 'Login',
        classes: expect.arrayContaining(['text-md', 'text-gray-900']),
        parent: mockUserNav,
      });
      const loginLink = mockUserNav.querySelector('a');
      expect(loginLink).not.toBeNull();
      if (loginLink) {
        loginLink.click();
      }
      expect(mockNavigateTo).toHaveBeenCalledWith('/login');
      expect(createUserDropdown).not.toHaveBeenCalled();
    });

    describe('when user is logged in', () => {
      beforeEach(() => {
        (useTokenStore.getState as jest.Mock).mockReturnValue({
          accessToken: 'mockToken',
        });
        (useCustomerStore.getState as jest.Mock).mockReturnValue({
          customer: { firstName: 'John' },
        });
        updateUserNavOnHeader(mockUserNav, mockRouter);
      });

      test('should display user actions', () => {
        // Assert
        expect(createElement).toHaveBeenCalledWith({
          classes: expect.arrayContaining(['flex', 'items-center', 'gap-4']),
          parent: expect.any(HTMLElement),
        });
        expect(createSvgUse).toHaveBeenCalledWith('#person', 'header-link');
        expect(createSvgUse).toHaveBeenCalledWith('#cart', 'header-link');
        expect(createSvgUse).toHaveBeenCalledWith('#about', 'header-link');
        expect(createUserDropdown).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.any(HTMLElement),
          mockRouter,
          { firstName: 'John' },
          mockUserNav,
          expect.any(Function)
        );
      });

      test('should navigate to cart page when cart icon is clicked', () => {
        // Act
        // Assuming cartLink is the second SVG created after person icon
        const cartLink = createdSvgUses[1];
        expect(cartLink).not.toBeNull();
        if (cartLink) {
          (cartLink as any).click();
        }

        // Assert
        expect(mockNavigateTo).toHaveBeenCalledWith('/cart');
        expect(mockNavigateTo).toHaveBeenCalledTimes(1);
      });

      test('should navigate to about info page when about icon is clicked', () => {
        // Act
        // Assuming aboutLink is the third SVG created after person and cart icons
        const aboutLink = createdSvgUses[2];
        expect(aboutLink).not.toBeNull();
        if (aboutLink) {
          (aboutLink as any).click();
        }

        // Assert
        expect(mockNavigateTo).toHaveBeenCalledWith('/aboutInfo');
        expect(mockNavigateTo).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('createHeaderElements', () => {
    let headerContainer: HTMLElement;

    beforeEach(() => {
      headerContainer = document.createElement('div');
      // Mock body.append to append to our test container
      (body.append as jest.Mock).mockImplementation((el) =>
        headerContainer.append(el)
      );
    });

    test('should create header elements correctly', () => {
      // Arrange
      const routerInstance = new Router(document.createElement('div'));

      // Act
      const { header, mainTitle, userNav } =
        createHeaderElements(routerInstance);

      // Assert
      expect(header).toBeInstanceOf(HTMLElement);
      expect(header.tagName).toBe('HEADER');
      expect(header.classList.contains('fixed')).toBe(true);
      expect(body.append).toHaveBeenCalledWith(header);

      expect(createSvgUse).toHaveBeenCalledWith('#logo', 'header-logo');
      const logoImg = createdSvgUses[0]; // Logo is the first SVG created
      expect(logoImg).not.toBeNull();
      if (logoImg) {
        (logoImg as any).click();
      }
      expect(mockNavigateTo).toHaveBeenCalledWith('/');

      expect(mainTitle).toBeInstanceOf(HTMLElement);
      expect(mainTitle.tagName).toBe('H1');
      expect(mainTitle.id).toBe('main-title');
      expect(mainTitle.textContent).toBe('Bubble Tea Store');
      expect(gsap.from).toHaveBeenCalledWith(
        mainTitle,
        expect.objectContaining({
          duration: 1,
          opacity: 0,
          x: -30,
        })
      );

      expect(userNav).toBeInstanceOf(HTMLElement);
      expect(userNav.id).toBe('user_nav');
      expect(userNav.classList.contains('flex')).toBe(true);
    });
  });
});

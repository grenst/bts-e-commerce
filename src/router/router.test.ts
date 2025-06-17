import {
  Router,
  Route,
  createRouterLink,
  createRouter,
  getRouter,
} from './router';
import {} from '../utils/element-utilities';
import { ModalManager } from '../components/layout/modal/product-modal';
import { getProductById } from '../api/products/product-service';

// Mock external dependencies
jest.mock('../utils/element-utilities', () => ({
  // Mock implementations removed as they are no longer used
}));

jest.mock('../components/layout/modal/product-modal', () => ({
  ModalManager: {
    getModal: jest.fn(() => ({
      hideModal: jest.fn(),
    })),
  },
}));

jest.mock('../api/products/product-service', () => ({
  getProductById: jest.fn(),
}));

// Mock window and history
const mockPushState = jest.fn();
const mockReplaceState = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

let historyState: Record<string, unknown> = {};
Object.defineProperty(globalThis, 'history', {
  value: {
    pushState: mockPushState,
    replaceState: mockReplaceState,
    get state() {
      return historyState;
    },
    set state(value: Record<string, unknown>) {
      historyState = value;
    },
  },
  writable: true,
});

Object.defineProperty(globalThis, 'location', {
  value: {
    pathname: '/',
    assign: jest.fn(),
  },
  writable: true,
});

let windowScrollY = 0;
Object.defineProperty(globalThis, 'window', {
  value: {
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    scrollTo: jest.fn(),
    get scrollY() {
      return windowScrollY;
    },
    set scrollY(value: number) {
      windowScrollY = value;
    },
    requestAnimationFrame: jest.fn((cb) => cb()),
  },
  writable: true,
});

describe('Router', () => {
  let mainContainer: HTMLElement;
  let router: Router;

  beforeEach(() => {
    mainContainer = document.createElement('div');
    mainContainer.id = 'main-container';
    document.body.append(mainContainer);
    router = new Router(mainContainer);

    // Reset mocks
    jest.clearAllMocks();
    (globalThis.location as { pathname: string }).pathname = '/';
    historyState = {};
  });

  afterEach(() => {
    mainContainer.remove();
  });

  describe('addRoute', () => {
    test('should add a route to the router', () => {
      const mockComponent = jest.fn();
      const route: Route = { path: '/test', component: mockComponent };
      router.addRoute(route);
      // Accessing private property for testing purposes
      expect((router as any).routes).toContain(route); // For testing private members
    });
  });

  describe('navigateTo', () => {
    test('should push a new state to history and handle route change', () => {
      const mockComponent = jest.fn();
      router.addRoute({ path: '/new', component: mockComponent });
      router.navigateTo('/new');

      expect(mockPushState).toHaveBeenCalledWith({}, '', '/new');
      // Expect handleRouteChange to be called, which will update currentPath
      expect((router as any).currentPath).toBe('/new'); // For testing private members
    });

    test('should not navigate if path and state are the same as current', () => {
      (router as any).currentPath = '/current'; // For testing private members
      router.navigateTo('/current');
      expect(mockPushState).not.toHaveBeenCalled();
    });

    test('should close modal if navigating to a non-product path', () => {
      const mockHideModal = jest.fn();
      (ModalManager.getModal as jest.Mock).mockReturnValue({
        hideModal: mockHideModal,
      });

      router.navigateTo('/some-path');
      expect(mockHideModal).toHaveBeenCalled();
    });

    test('should not close modal if navigating to a product path', () => {
      const mockHideModal = jest.fn();
      (ModalManager.getModal as jest.Mock).mockReturnValue({
        hideModal: mockHideModal,
      });

      router.navigateTo('/catalog/123e4567-e89b-12d3-a456-426614174000');
      expect(mockHideModal).not.toHaveBeenCalled();
    });

    test('should not close modal if state indicates modal is open', () => {
      const mockHideModal = jest.fn();
      (ModalManager.getModal as jest.Mock).mockReturnValue({
        hideModal: mockHideModal,
      });

      router.navigateTo('/some-path', { isModalOpen: true });
      expect(mockHideModal).not.toHaveBeenCalled();
    });
  });

  describe('handleRouteChange', () => {
    let mockComponent: jest.Mock;

    beforeEach(() => {
      mockComponent = jest.fn();
      router.addRoute({ path: '/home', component: mockComponent });
      router.addRoute({ path: '/catalog', component: mockComponent });
      router.addRoute({ path: '/cart', component: mockComponent });
      router.addRoute({ path: '*', component: mockComponent }); // Wildcard route
    });

    test('should update currentPath and call component for matching route', async () => {
      (globalThis.location as { pathname: string }).pathname = '/home';
      await (router as any).handleRouteChange(); // For testing private members

      expect((router as any).currentPath).toBe('/home'); // For testing private members
      expect(mockComponent).toHaveBeenCalledTimes(1);
      expect(mockComponent).toHaveBeenCalledWith(mainContainer, router);
    });

    test('should redirect from / to /main', async () => {
      (globalThis.location as { pathname: string }).pathname = '/';
      const navigateToSpy = jest.spyOn(router, 'navigateTo');
      await (router as any).handleRouteChange(); // For testing private members

      expect(navigateToSpy).toHaveBeenCalledWith('/main');
      navigateToSpy.mockRestore();
    });

    test('should handle product detail path and navigate to base path with modal state', async () => {
      (globalThis.location as { pathname: string }).pathname =
        '/catalog/123e4567-e89b-12d3-a456-426614174000';
      (getProductById as jest.Mock).mockResolvedValue({ slug: 'test-product' });
      const navigateToSpy = jest.spyOn(router, 'navigateTo');

      await (router as any).handleRouteChange(); // For testing private members

      expect(getProductById).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(navigateToSpy).toHaveBeenCalledWith('/catalog', {
        isModalOpen: true,
        productId: '123e4567-e89b-12d3-a456-426614174000',
        productSlug: 'test-product',
      });
      navigateToSpy.mockRestore();
    });

    test('should navigate to /error if product not found', async () => {
      (globalThis.location as { pathname: string }).pathname =
        '/catalog/123e4567-e89b-12d3-a456-426614174000';
      (getProductById as jest.Mock).mockResolvedValue(undefined);
      const navigateToSpy = jest.spyOn(router, 'navigateTo');

      await (router as any).handleRouteChange(); // For testing private members

      expect(navigateToSpy).toHaveBeenCalledWith('/error');
      navigateToSpy.mockRestore();
    });

    test('should navigate to /error if product service throws an error', async () => {
      (globalThis.location as { pathname: string }).pathname =
        '/catalog/123e4567-e89b-12d3-a456-426614174000';
      (getProductById as jest.Mock).mockRejectedValue(new Error('API error'));
      const navigateToSpy = jest.spyOn(router, 'navigateTo');

      await (router as any).handleRouteChange(); // For testing private members

      expect(navigateToSpy).toHaveBeenCalledWith('/error');
      navigateToSpy.mockRestore();
    });

    test('should use wildcard route if no specific route matches', async () => {
      (globalThis.location as { pathname: string }).pathname = '/non-existent';
      await (router as any).handleRouteChange(); // For testing private members

      expect((router as any).currentPath).toBe('/non-existent');
      expect(mockComponent).toHaveBeenCalledTimes(1);
      expect(mockComponent).toHaveBeenCalledWith(mainContainer, router);
    });

    test('should not handle route change if current path is the same', async () => {
      (router as any).currentPath = '/home'; // For testing private members
      (globalThis.location as { pathname: string }).pathname = '/home';
      await (router as any).handleRouteChange(); // For testing private members

      expect(mockComponent).not.toHaveBeenCalled();
    });

    test('should close modal if not a product path and not opening modal', async () => {
      const mockHideModal = jest.fn();
      (ModalManager.getModal as jest.Mock).mockReturnValue({
        hideModal: mockHideModal,
      });
      (globalThis.location as { pathname: string }).pathname = '/home';
      historyState = {};

      await (router as any).handleRouteChange(); // For testing private members
      expect(mockHideModal).toHaveBeenCalled();
    });

    test('should not close modal if it is a product path', async () => {
      const mockHideModal = jest.fn();
      (ModalManager.getModal as jest.Mock).mockReturnValue({
        hideModal: mockHideModal,
      });
      (globalThis.location as { pathname: string }).pathname =
        '/catalog/123e4567-e89b-12d3-a456-426614174000';
      historyState = {};

      await (router as any).handleRouteChange(); // For testing private members
      expect(mockHideModal).not.toHaveBeenCalled();
    });

    test('should not close modal if state indicates modal is open', async () => {
      const mockHideModal = jest.fn();
      (ModalManager.getModal as jest.Mock).mockReturnValue({
        hideModal: mockHideModal,
      });
      (globalThis.location as { pathname: string }).pathname = '/home';
      historyState = { isModalOpen: true };

      await (router as any).handleRouteChange(); // For testing private members
      expect(mockHideModal).not.toHaveBeenCalled();
    });
  });

  describe('scroll position management', () => {
    test('should save current scroll position', () => {
      (router as any).currentPath = '/test-path'; // For testing private members
      windowScrollY = 100;
      (router as any).saveCurrentScrollPosition(); // For testing private members
      expect((router as any).scrollPositions.get('/test-path')).toBe(100); // For testing private members
    });

    test('should restore scroll position', () => {
      (router as any).scrollPositions.set('/test-path', 200); // For testing private members
      (router as any).restoreScrollPosition('/test-path'); // For testing private members
      expect(globalThis.window.scrollTo).toHaveBeenCalledWith(0, 200);
    });

    test('should restore scroll position to 0 if no saved position', () => {
      (router as any).restoreScrollPosition('/non-existent-path'); // For testing private members
      expect(globalThis.window.scrollTo).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('init', () => {
    test('should navigate to /main if pathname is /', () => {
      (globalThis.location as { pathname: string }).pathname = '/';
      const navigateToSpy = jest.spyOn(router, 'navigateTo');
      router.init();
      expect(navigateToSpy).toHaveBeenCalledWith('/main');
      navigateToSpy.mockRestore();
    });

    test('should handle route change if pathname is not /', () => {
      (globalThis.location as { pathname: string }).pathname = '/catalog';
      const handleRouteChangeSpy = jest.spyOn(
        router as any, // For testing private members
        'handleRouteChange'
      );
      router.init();
      expect(handleRouteChangeSpy).toHaveBeenCalled();
      handleRouteChangeSpy.mockRestore();
    });
  });

  describe('clearCache', () => {
    test('should clear page containers and scroll positions', () => {
      (router as any).pageContainers.set(
        // For testing private members
        '/test',
        document.createElement('div')
      );
      (router as any).scrollPositions.set('/test', 100); // For testing private members
      router.clearCache();
      expect((router as any).pageContainers.size).toBe(0); // For testing private members
      expect((router as any).scrollPositions.size).toBe(0); // For testing private members
    });
  });

  describe('clearPageCache', () => {
    test('should clear specific page container and scroll position', () => {
      (router as any).pageContainers.set(
        // For testing private members
        '/test',
        document.createElement('div')
      );
      (router as any).scrollPositions.set('/test', 100); // For testing private members
      router.clearPageCache('/test');
      expect((router as any).pageContainers.has('/test')).toBe(false); // For testing private members
      expect((router as any).scrollPositions.has('/test')).toBe(false); // For testing private members
    });
  });
});

describe('createRouterLink', () => {
  let parentElement: HTMLElement;
  let mockRouter: Router;

  beforeEach(() => {
    parentElement = document.createElement('div');
    mockRouter = { navigateTo: jest.fn() } as unknown as Router; // For testing private members
    jest.clearAllMocks();
  });

  test('should create an anchor element with correct attributes and text', () => {
    const link = createRouterLink('Home', '/home', parentElement, mockRouter);
    expect(link.tagName).toBe('A');
    expect(link.textContent).toBe('Home');
    expect(link.getAttribute('href')).toBe('/home');
    expect(link.classList.contains('router-link')).toBe(true);
    expect(parentElement.contains(link)).toBe(true);
  });

  test('should add additional classes if provided', () => {
    const link = createRouterLink(
      'About',
      '/about',
      parentElement,
      mockRouter,
      ['btn', 'btn-primary']
    );
    expect(link.classList.contains('btn')).toBe(true);
    expect(link.classList.contains('btn-primary')).toBe(true);
  });

  test('should call router.navigateTo on click', () => {
    const link = createRouterLink('Cart', '/cart', parentElement, mockRouter);
    link.click();
    expect(mockRouter.navigateTo).toHaveBeenCalledWith('/cart');
  });

  test('should prevent default on click', () => {
    const link = createRouterLink('Test', '/test', parentElement, mockRouter);
    const mockEvent = { preventDefault: jest.fn() };
    link.dispatchEvent(new MouseEvent('click'));
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });
});

describe('createRouter and getRouter', () => {
  let container: HTMLElement;
  let createRouterFn: typeof createRouter;
  let getRouterFn: typeof getRouter;

  beforeEach(() => {
    jest.resetModules(); // Reset module registry to get a fresh import
    createRouterFn = createRouter;
    getRouterFn = getRouter;
    container = document.createElement('div');
    jest.clearAllMocks();
  });

  test('createRouter should create a new router instance if one does not exist', () => {
    const router1 = createRouterFn(container);
    expect(router1).toBeInstanceOf(Router);
    // Check if routes are added
    expect((router1 as any).routes.length).toBeGreaterThan(0); // For testing private members
  });

  test('createRouter should return the existing router instance if one already exists', () => {
    const router1 = createRouterFn(container);
    const router2 = createRouterFn(container);
    expect(router1).toBe(router2);
  });

  test('getRouter should return the existing router instance', () => {
    const router1 = createRouterFn(container);
    const retrievedRouter = getRouterFn();
    expect(retrievedRouter).toBe(router1);
  });

  test('getRouter should throw an error if router has not been initialized', () => {
    // Ensure routerInstance is undefined by resetting modules
    expect(() => getRouterFn()).toThrow(
      'Router has not been initialized. Call createRouter first.'
    );
  });
});

import {
  createEl as createElement,
  removeAllChild,
} from '../utils/element-utilities';
import { createCatalogPage } from '../pages/catalog/catalog';
import { createCartPage } from '../pages/cart/cart';
import { ModalManager } from '../components/layout/modal/product-modal';

export interface Route {
  path: string;
  component: (container: HTMLElement, router: Router) => void;
  preserveState?: boolean;
}

type RouteState = Record<string, unknown>;

export class Router {
  private routes: Route[] = [];
  private mainContainer: HTMLElement;
  private pageContainers: Map<string, HTMLElement> = new Map();
  private currentPath = '';
  private scrollPositions: Map<string, number> = new Map();

  constructor(container: HTMLElement) {
    this.mainContainer = container;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    globalThis.addEventListener('popstate', () => this.handleRouteChange());
    globalThis.addEventListener('beforeunload', () =>
      this.saveCurrentScrollPosition()
    );
  }

  addRoute(route: Route): void {
    this.routes.push(route);
  }

  navigateTo(path: string, state: RouteState = {}): void {
    if (this.currentPath === path && Object.keys(state).length === 0) return;

    // Проверяем, является ли текущий переход открытием модалки
    // const isOpeningModal = state?.openProductModal !== undefined;
    // Закрываем модалку только если:
    // 1. Это не переход открытия модалки
    // 2. Путь не содержит ID продукта
    const isProductPath = path.match(
      /^\/(catalog|main)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
    );
    const modal = ModalManager.getModal();
    // if (modal && !isOpeningModal && !isProductPath) {
    //   modal.hideModal();
    // }
    // Закрываем модалку только при явном переходе не на продукт
    if (modal && !isProductPath && !state?.isModalOpen) {
      modal.hideModal();
    }

    globalThis.history.pushState(state, '', path);
    this.handleRouteChange();
  }

  private async handleRouteChange(): Promise<void> {
    const path = globalThis.location.pathname;
    if (this.currentPath === path) return;

    this.saveCurrentScrollPosition();
    // this.currentPath = path;

    /************************************************* */
    const state = history.state;

    const isOpeningModal = state?.isModalOpen;
    // const isOpeningModal = state?.openProductModal !== undefined;
    const isProductPath = path.match(
      /^\/(catalog|main)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
    );
    // const isComingFromProduct = this.currentPath.match(
    //   /^\/(catalog|main)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
    // );

    const modal = ModalManager.getModal();
    console.log(modal);
    if (modal && !isProductPath && !isOpeningModal) {
      modal.hideModal();
    }

    // Закрываем модалку если:
    // 1. Это не открытие модалки
    // 2. Это не страница продукта
    // 3. ИЛИ это переход назад с продукта на /main
    // if (
    //   (modal && !isOpeningModal && !isProductPath) ||
    //   (isComingFromProduct && path === '/main')
    // ) {
    //   modal.hideModal();

    //   // console.log(`Попытка закрыть ${modal}`);
    // }

    this.currentPath = path;

    /************************************************* */

    if (path === '/') {
      this.navigateTo('/main');
      return;
    }

    const productDetailMatch = path.match(
      /^\/(catalog|main)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
    );
    if (productDetailMatch) {
      const basePath = `/${productDetailMatch[1]}`;
      const productId = productDetailMatch[2];

      const validBasePaths = ['/catalog', '/main'];
      if (!validBasePaths.includes(basePath)) {
        this.navigateTo('/error');
        return;
      }

      try {
        const { getProductById } = await import(
          '../api/products/product-service'
        );
        const product = await getProductById(productId);
        if (!product) {
          this.navigateTo('/error');
          return;
        }

        // this.navigateTo(basePath, { openProductModal: productId });
        // Явно указываем, что это открытие модалки
        this.navigateTo(basePath, {
          isModalOpen: true,
          productId: productId,
          productSlug: product.slug,
        });
        return;
      } catch (error) {
        console.error('Error checking product existence:', error);
        this.navigateTo('/error');
        return;
      }
    }

    const route = this.findRoute(path);
    if (route) this.processRoute(route, path);
  }

  private findRoute(path: string): Route | undefined {
    return (
      this.routes.find((r) => r.path === path) ||
      this.routes.find((r) => r.path === '*')
    );
  }

  private processRoute(route: Route, path: string): void {
    const hasSavedContainer =
      this.pageContainers.has(path) && route.preserveState;

    let pageContainer = this.pageContainers.get(path);

    if (!pageContainer) {
      pageContainer = this.createPageContainer(route);
      this.pageContainers.set(path, pageContainer);
      console.log(`Создали новый контейнер для ${path}`);
    }

    removeAllChild(this.mainContainer);

    if (hasSavedContainer) {
      this.mainContainer.append(pageContainer);
      this.restoreScrollPosition(path);
      console.log(`Восстановили сохранённое состояние для ${path}`);
    } else {
      route.component(this.mainContainer, this);
      window.scrollTo(0, 0);
      console.log(`Первая отрисовка ${path}`);
    }
  }

  private createPageContainer(route: Route): HTMLElement {
    const pageContainer = createElement({
      tag: 'div',
      classes: ['page-container'],
    });
    route.component(pageContainer, this);
    return pageContainer;
  }

  private saveCurrentScrollPosition(): void {
    if (this.currentPath)
      this.scrollPositions.set(this.currentPath, window.scrollY);
  }

  private restoreScrollPosition(path: string): void {
    requestAnimationFrame(() => {
      const savedPosition = this.scrollPositions.get(path) ?? 0;
      window.scrollTo(0, savedPosition);
    });
  }

  init(): void {
    if (globalThis.location.pathname === '/') {
      this.navigateTo('/main');
    } else {
      this.handleRouteChange();
    }
  }

  clearCache(): void {
    this.pageContainers.clear();
    this.scrollPositions.clear();
  }

  clearPageCache(path: string): void {
    this.pageContainers.delete(path);
    this.scrollPositions.delete(path);
  }
}

export function createRouterLink(
  text: string,
  path: string,
  parent: HTMLElement,
  router: Router,
  addClasses: string[] = []
): HTMLAnchorElement {
  const link = createElement({
    tag: 'a',
    text,
    parent,
    classes: ['router-link', ...addClasses],
    attributes: { href: path },
  });

  if (!(link instanceof HTMLAnchorElement)) {
    throw new TypeError('Created element is not an HTMLAnchorElement');
  }

  link.addEventListener('click', (event_) => {
    event_.preventDefault();
    router.navigateTo(path);
  });

  return link;
}

let routerInstance: Router | undefined;

export function createRouter(container: HTMLElement): Router {
  if (!routerInstance) {
    routerInstance = new Router(container);
    routerInstance.addRoute({
      path: '/catalog',
      component: createCatalogPage,
      preserveState: true,
    });
    routerInstance.addRoute({
      path: '/cart',
      component: createCartPage,
      preserveState: true,
    });
  }
  return routerInstance;
}

export function getRouter(): Router {
  if (!routerInstance) {
    throw new Error(
      'Router has not been initialized. Call createRouter first.'
    );
  }
  return routerInstance;
}

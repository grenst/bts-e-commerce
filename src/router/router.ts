import {
  createEl as createElement,
  removeAllChild,
} from '../utils/element-utils';

export interface Route {
  path: string;
  component: (container: HTMLElement) => void;
  preserveState?: boolean; // Флаг, нужно ли сохранять состояние для этого маршрута
}

export class Router {
  private routes: Route[] = [];
  private container: HTMLElement;
  private currentPath: string = '';
  private pageStates: Map<string, HTMLElement> = new Map(); // cохранение состояния страницы
  private scrollPositions: Map<string, number> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
    // globalThis.addEventListener('popstate', () => this.handleRouteChange());
    // window.addEventListener('popstate', () => this.handleRouteChange());
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    globalThis.addEventListener('popstate', () => this.handleRouteChange());
    // window.addEventListener('popstate', () => this.handleRouteChange());
    // window.addEventListener('beforeunload', () =>
    globalThis.addEventListener('beforeunload', () =>
      this.saveCurrentScrollPosition()
    );
  }

  addRoute(route: Route): void {
    this.routes.push(route);
  }

  navigateTo(path: string): void {
    // globalThis.history.pushState({}, '', path);
    if (this.currentPath === path) return;

    this.saveCurrentState();
    globalThis.history.pushState({}, '', path);
    // window.history.pushState({}, '', path);
    this.handleRouteChange();
  }

  private saveCurrentState(): void {
    if (this.currentPath && this.container.children.length > 0) {
      const currentRoute = this.routes.find((r) => r.path === this.currentPath);
      if (currentRoute?.preserveState) {
        this.pageStates.set(
          this.currentPath,
          this.container.cloneNode(true) as HTMLElement
        );
        this.saveCurrentScrollPosition();
      }
    }
  }

  private saveCurrentScrollPosition(): void {
    if (this.currentPath) {
      this.scrollPositions.set(this.currentPath, window.scrollY);
    }
  }

  private handleRouteChange(): void {
    const path = globalThis.location.pathname;
    // const path = window.location.pathname;

    if (this.currentPath === path) return;

    // Сохраняем текущее состояние перед переходом
    // if (this.currentPath && this.container.children.length > 0) {
    //   const currentRoute = this.routes.find((r) => r.path === this.currentPath);
    //   if (currentRoute?.preserveState) {
    //     this.pageStates.set(
    //       this.currentPath,
    //       this.container.cloneNode(true) as HTMLElement
    //     );
    //   }
    // }

    this.saveCurrentState();

    this.currentPath = path;

    if (path === '/') {
      this.navigateTo('/main'); // редирект
      return;
    }

    const route = this.routes.find((r) => r.path === path);

    if (route) {
      // if (route.preserveState && this.pageStates.has(path)) {
      //   removeAllChild(this.container);
      //   this.container.appendChild(this.pageStates.get(path)!);
      //   console.log('Страница из состояния');
      // } else {
      //   removeAllChild(this.container);
      //   route.component(this.container);
      // }
      this.renderRoute(route);
      return;
    }

    // Error Page if route not found
    // const wildcardRoute = this.routes.find((r) => r.path === '*');
    // if (wildcardRoute) {
    //   removeAllChild(this.container);
    //   wildcardRoute.component(this.container);
    //   return;
    // }

    this.renderWildcardRoute();
  }

  private renderRoute(route: Route): void {
    removeAllChild(this.container);

    if (route.preserveState && this.pageStates.has(route.path)) {
      this.restoreState(route.path);
    } else {
      route.component(this.container);
      window.scrollTo(0, 0);
      console.log(`Первая отрисовка ${route.path}`);
    }
  }

  private restoreState(path: string): void {
    const savedState = this.pageStates.get(path);
    if (savedState) {
      this.container.appendChild(savedState);
      this.restoreScrollPosition(path);
      console.log(`Страница из сохранённого состояния ${path}`);
    }
  }

  private restoreScrollPosition(path: string): void {
    requestAnimationFrame(() => {
      const savedPosition = this.scrollPositions.get(path) || 0;
      window.scrollTo(0, savedPosition);
    });
  }

  // Error Page if route not found
  private renderWildcardRoute(): void {
    const wildcardRoute = this.routes.find((r) => r.path === '*');
    if (wildcardRoute) {
      removeAllChild(this.container);
      wildcardRoute.component(this.container);
      window.scrollTo(0, 0);
    }
  }

  init(): void {
    if (window.location.pathname === '/') {
      this.navigateTo('/main'); // Редирект на /main при загрузке
    } else {
      this.handleRouteChange(); // Обычная обработка
    }
  }

  // методы очистки состояний (на всякий случай)
  clearStates(): void {
    this.pageStates.clear();
  }

  clearStateForPath(path: string): void {
    this.pageStates.delete(path);
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
  }) as HTMLAnchorElement;

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

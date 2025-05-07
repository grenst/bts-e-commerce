import { createEl, removeAllChild } from '../utils/elementUtils';

export interface Route {
  path: string;
  component: (container: HTMLElement) => void;
}

export class Router {
  private routes: Route[] = [];
  private container: HTMLElement;
  private currentPath: string = '';

  constructor(container: HTMLElement) {
    this.container = container;
    window.addEventListener('popstate', () => this.handleRouteChange());
  }

  addRoute(route: Route): void {
    this.routes.push(route);
  }

  navigateTo(path: string): void {
    window.history.pushState({}, '', path);
    this.handleRouteChange();
  }

  private handleRouteChange(): void {
    const path = window.location.pathname;

    if (this.currentPath === path) return;
    this.currentPath = path;

    const route = this.routes.find((r) => r.path === path);

    if (route) {
      removeAllChild(this.container);
      route.component(this.container);
    } else {
      // Default to home if route not found
      const homeRoute = this.routes.find((r) => r.path === '/');
      if (homeRoute) {
        removeAllChild(this.container);
        homeRoute.component(this.container);
      }
    }
  }

  init(): void {
    this.handleRouteChange();
  }
}

export function createRouterLink(
  text: string,
  path: string,
  parent: HTMLElement,
  router: Router,
  addClasses: string[] = []
): HTMLAnchorElement {
  const link = createEl({
    tag: 'a',
    text,
    parent,
    classes: ['router-link', ...addClasses],
    attributes: { href: path },
  }) as HTMLAnchorElement;

  link.addEventListener('click', (e) => {
    e.preventDefault();
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

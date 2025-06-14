import { initAuthPage } from './auth-controller';
import './auth-page.scss';

export default function createAuthPage(container: HTMLElement): void {
  initAuthPage(container);
}

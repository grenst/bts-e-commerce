export const debug = (...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.debug('[Auth]', ...args);
  };
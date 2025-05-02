const appElement = document.querySelector<HTMLDivElement>('#app');

if (appElement) {
  appElement.innerHTML = `
    <h1>E-commerce App</h1>
    <p>Loading...</p>
    `;
  // TODO: It's for now so...
} else {
  console.error('Root element #app not found');
}

export {};

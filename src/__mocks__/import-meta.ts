// Mock for import.meta
const meta = {
  env: {
    MODE: 'test',
    VITE_SOME_KEY: 'some_value',
  },
};

// Export as a getter to make it non-writable
Object.defineProperty(meta, 'env', {
  value: meta.env,
  writable: false,
});

export default meta;

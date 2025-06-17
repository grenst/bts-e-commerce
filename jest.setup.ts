// Mock TextEncoder and TextDecoder for JSDOM
class MockTextEncoder {
  encode(str: string): Uint8Array {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buf[i] = str.charCodeAt(i);
    }
    return buf;
  }
}

class MockTextDecoder {
  decode(buffer: Uint8Array): string {
    let str = '';
    for (let i = 0; i < buffer.length; i++) {
      str += String.fromCharCode(buffer[i]);
    }
    return str;
  }
}

// Mock IntersectionObserver for JSDOM
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

// Extend global interfaces without redefining
declare global {
  interface TextEncoder extends MockTextEncoder {}
  interface TextDecoder extends MockTextDecoder {}
  interface Window {
    IntersectionObserver: typeof MockIntersectionObserver;
  }
}

global.TextEncoder = MockTextEncoder as any;
global.TextDecoder = MockTextDecoder as any;
global.IntersectionObserver = MockIntersectionObserver as any;
process.env.NODE_ENV = 'test';

// Make this file a module
export {};
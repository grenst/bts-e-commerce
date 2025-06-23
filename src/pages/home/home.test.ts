import { newDrinksData } from '../../data/new-drinks-data';
import { createEl as createElement } from '../../utils/element-utilities';
import { initScrollReveal } from '../../utils/scroll-reveal';
import { createHelloSection } from '../../components/hello-section/create-hello-section';
import { createDrinkSection } from '../../components/new-drink/create-drink-section';
import { createScrollTopButton } from '../../components/features/scroll-top-button';
import { createPromoGrid } from '../../components/layout/promo-grid/promo-grid';
import mainNew from './home';

// Mock all the imported functions
jest.mock('../../utils/element-utilities', () => ({
  createEl: jest.fn(),
}));

jest.mock('../../components/hello-section/create-hello-section', () => ({
  createHelloSection: jest.fn(),
}));

jest.mock('../../components/new-drink/create-drink-section', () => ({
  createDrinkSection: jest.fn(),
}));

jest.mock('../../components/features/scroll-top-button', () => ({
  createScrollTopButton: jest.fn(),
}));

jest.mock('../../components/layout/promo-grid/promo-grid', () => ({
  createPromoGrid: jest.fn(),
}));

jest.mock('../../utils/scroll-reveal', () => ({
  initScrollReveal: jest.fn(),
}));

describe('mainNew', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create a mock container element before each test
    container = document.createElement('div');
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a mock implementation for createElement that handles parent-child relationships
    (createElement as jest.Mock).mockImplementation(
      ({ tag, classes, parent, attributes }) => {
        const el = document.createElement(tag);
        if (classes) el.className = classes.join(' ');
        if (attributes) {
          for (const [key, value] of Object.entries(attributes)) {
            el.setAttribute(key, value as string);
          }
        }
        if (parent) parent.append(el);
        return el;
      }
    );

    // Mock createHelloSection to return a div element
    (createHelloSection as jest.Mock).mockReturnValue(
      document.createElement('div')
    );

    // Mock createDrinkSection to return a div element
    (createDrinkSection as jest.Mock).mockReturnValue(
      document.createElement('div')
    );

    // Mock createPromoGrid to return a div element
    (createPromoGrid as jest.Mock).mockReturnValue(
      document.createElement('div')
    );

    // Mock createScrollTopButton to return a div element
    (createScrollTopButton as jest.Mock).mockReturnValue(
      document.createElement('div')
    );
  });

  test('creates the main container and appends it to the provided container', () => {
    mainNew(container);

    expect(createElement).toHaveBeenCalledWith({
      tag: 'div',
      classes: ['main-new-container'],
      parent: container,
    });

    expect(container.children.length).toBeGreaterThan(0);
  });

  test('calls createHelloSection with the correct arguments', () => {
    mainNew(container);

    expect(createHelloSection).toHaveBeenCalled();

    expect(createHelloSection).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.any(String)
    );
  });

  test('calls createDrinkSection three times with correct arguments', () => {

    mainNew(container);

    expect(createDrinkSection).toHaveBeenCalledTimes(3);

    // Verify the arguments for each call
    // First call (Drink 1)
    expect(createDrinkSection).toHaveBeenNthCalledWith(
      1,
      expect.any(HTMLElement),
      expect.objectContaining({
        id: 'new-drink-1-anchor',
        backgroundSrc: expect.any(String),
        imageSrc: expect.any(String),
        title: newDrinksData.drink_1.title,
        description: newDrinksData.drink_1.description,
        contentSide: 'right',
      })
    );

    // Second call (Drink 2)
    expect(createDrinkSection).toHaveBeenNthCalledWith(
      2,
      expect.any(HTMLElement),
      expect.objectContaining({
        id: 'new-drink-2-anchor',
        backgroundSrc: expect.any(String),
        imageSrc: expect.any(String),
        title: newDrinksData.drink_2.title,
        description: newDrinksData.drink_2.description,
        contentSide: 'left',
      })
    );

    // Third call (Drink 3)
    expect(createDrinkSection).toHaveBeenNthCalledWith(
      3,
      expect.any(HTMLElement),
      expect.objectContaining({
        id: 'new-drink-3-anchor',
        backgroundSrc: expect.any(String),
        imageSrc: expect.any(String),
        title: newDrinksData.drink_3.title,
        description: newDrinksData.drink_3.description,
        contentSide: 'right',
      })
    );
  });

  test('creates the promo section and calls createPromoGrid with correct arguments', () => {
    // Call the function under test
    mainNew(container);

    // Verify that createElement was called to create the promo section
    // We need to find the call that creates the promo section
    const createElementCalls = (createElement as jest.Mock).mock.calls;
    let promoSectionCreated = false;

    // Check if createElement was called with the parameters for the promo section
    for (const call of createElementCalls) {
      const params = call[0];
      if (params.classes && params.classes.includes('actions-section')) {
        promoSectionCreated = true;
        // Verify the parameters for the promo section
        expect(params).toEqual(
          expect.objectContaining({
            tag: 'section',
            classes: expect.arrayContaining([
              'scroll-reveal--hidden',
              'actions-section',
              'full-screen-section',
            ]),
            attributes: { id: 'actions-anchor' },
            parent: expect.any(HTMLElement),
          })
        );
        break;
      }
    }

    // Verify that promo section was created
    expect(promoSectionCreated).toBe(true);

    // Verify that createPromoGrid was called
    expect(createPromoGrid).toHaveBeenCalled();

    // Verify that createPromoGrid was called with the expected object containing images and promoText
    expect(createPromoGrid).toHaveBeenCalledWith(
      expect.objectContaining({
        images: expect.arrayContaining([
          expect.any(String),
          expect.any(String),
          expect.any(String),
          expect.any(String),
          expect.any(String),
        ]),
        promoText: 'SUMMER15',
      })
    );
  });

  test('calls initScrollReveal and createScrollTopButton', () => {
    // Call the function under test
    mainNew(container);

    // Verify that initScrollReveal was called
    expect(initScrollReveal).toHaveBeenCalled();

    // Verify that initScrollReveal was called with the container
    expect(initScrollReveal).toHaveBeenCalledWith(expect.any(HTMLElement));

    // Verify that createScrollTopButton was called
    expect(createScrollTopButton).toHaveBeenCalled();

    // Verify that createScrollTopButton was called with document.body
    expect(createScrollTopButton).toHaveBeenCalledWith(document.body);
  });
});

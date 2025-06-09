import { createEl as createElement } from '../../utils/element-utilities';

function format(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}
export interface LineItem {
  id: string;
  productId: string;
  name: string;
  variantId: number;
  volume: string;
  price: number; // centAmount
  quantity: number;
  imageUrl: string;
}

export function createCartItem(
  item: LineItem,
  actions: {
    onQuantityChange: (newQty: number) => void;
    onRemove: () => void;
  }
): HTMLElement {
  const root = createElement({
    tag: 'div',
    classes: [
      'cart-item',
      'grid',
      'grid-cols-1',
      'md:grid-cols-[60px_2fr_1fr_auto]',
      'gap-4',
      'items-center',
    ],
  });

  /* image */
  root.append(
    createElement({
      tag: 'img',
      attributes: { src: item.imageUrl, alt: item.name },
      classes: ['w-16', 'h-16', 'object-cover', 'rounded-md'],
    })
  );

  /* name + volume */
  const details = createElement({ tag: 'div', classes: ['flex', 'flex-col'] });
  details.append(
    createElement({ tag: 'span', classes: ['font-medium'], text: item.name })
  );
  details.append(
    createElement({
      tag: 'span',
      classes: ['text-sm', 'text-gray-500'],
      text: item.volume,
    })
  );
  root.append(details);

  /* qty controls */
  const qtyBox = createElement({
    tag: 'div',
    classes: ['flex', 'items-center'],
  });
  const minus = createElement({
    tag: 'button',
    classes: [
      'w-8',
      'h-8',
      'border',
      'border-gray-300',
      'rounded-l-md',
      'bg-gray-50',
      'hover:bg-gray-100',
    ],
    text: '−',
  });
  const qtyDisplay = createElement({
    tag: 'span',
    classes: [
      'w-10',
      'h-8',
      'flex',
      'items-center',
      'justify-center',
      'border-y',
      'border-gray-300',
    ],
    text: String(item.quantity),
  });
  const plus = createElement({
    tag: 'button',
    classes: [
      'w-8',
      'h-8',
      'border',
      'border-gray-300',
      'rounded-r-md',
      'bg-gray-50',
      'hover:bg-gray-100',
    ],
    text: '+',
  });
  qtyBox.append(minus, qtyDisplay, plus);
  root.append(qtyBox);

  /* subtotal + remove */
  const priceBox = createElement({
    tag: 'div',
    classes: ['flex', 'items-center', 'gap-4'],
  });
  const subtotal = createElement({
    tag: 'span',
    classes: ['font-medium'],
    text: format(item.price * item.quantity),
  });
  const removeButton = createElement({
    tag: 'button',
    classes: ['text-red-600', 'hover:text-red-800'],
    text: '🗑',
  });
  priceBox.append(subtotal, removeButton);
  root.append(priceBox);

  /* mobile layout */
  root.append(
    createElement({
      tag: 'div',
      classes: ['md:hidden', 'col-span-full', 'h-px', 'bg-gray-200', 'mt-4'],
    })
  );

  /* handlers */
  minus.addEventListener('click', () => {
    if (item.quantity > 1) actions.onQuantityChange(item.quantity - 1);
  });
  plus.addEventListener('click', () =>
    actions.onQuantityChange(item.quantity + 1)
  );
  removeButton.addEventListener('click', () => actions.onRemove());

  return root;
}

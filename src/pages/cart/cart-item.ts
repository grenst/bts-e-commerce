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
  price: number; // centAmount - original price
  discountedPrice?: number; // centAmount - after discounts
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
      'md:grid-cols-[80px_1fr_auto_auto]',
      'gap-4',
      'items-center',
    ],
  });

  // Product image with better styling
  const imageWrapper = createElement({
    tag: 'div',
    classes: ['flex', 'justify-center', 'md:justify-start'],
  });

  const image = createElement({
    tag: 'img',
    attributes: {
      src: item.imageUrl || '/placeholder-product.jpg',
      alt: item.name,
      loading: 'lazy',
    },
    classes: ['cart-item-image'],
  });

  // Handle image load errors
  image.addEventListener('error', () => {
    image.setAttribute(
      'src',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0yNCAzMkw0MCA0OEw1NiAzMiIgc3Ryb2tlPSIjOTRBM0I4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K'
    );
  });

  imageWrapper.append(image);
  root.append(imageWrapper);

  // Product details with improved typography
  const details = createElement({
    tag: 'div',
    classes: ['cart-item-details', 'min-w-0'],
  });

  const nameElement = createElement({
    tag: 'h3',
    classes: ['item-name'],
    text: item.name,
  });

  const volumeElement = createElement({
    tag: 'p',
    classes: ['item-volume'],
    text: item.volume || 'Standard size',
  });

  details.append(nameElement, volumeElement);
  root.append(details);

  // Quantity controls with better UX
  const qtyWrapper = createElement({
    tag: 'div',
    classes: ['flex', 'justify-between', 'gap-6'],
    // classes: ['flex', 'justify-between', 'sm:justify-start', 'gap-6'],
  });

  const qtyBox = createElement({
    tag: 'div',
    classes: ['quantity-controls'],
  });

  const minus = createElement({
    tag: 'button',
    attributes: {
      type: 'button',
      'aria-label': 'Decrease quantity',
    },
    text: '−',
  });
  if (item.quantity <= 1) minus.setAttribute('disabled', '');

  const qtyDisplay = createElement({
    tag: 'span',
    classes: ['quantity-display'],
    text: String(item.quantity),
  });

  const plus = createElement({
    tag: 'button',
    attributes: {
      type: 'button',
      'aria-label': 'Increase quantity',
    },
    text: '+',
  });

  qtyBox.append(minus, qtyDisplay, plus);
  qtyWrapper.append(qtyBox);
  root.append(qtyWrapper);

  // Price and remove section
  const priceWrapper = createElement({
    tag: 'div',
    classes: ['cart-item-price'],
  });

  const subtotal = createElement({
    tag: 'span',
    classes: ['subtotal'],
    text: format((item.discountedPrice ?? item.price) * item.quantity),
  });

  // Add data attribute for original price
  subtotal.dataset.originalPrice = format(item.price * item.quantity);

  const removeButton = createElement({
    tag: 'button',
    classes: ['remove-button'],
    attributes: {
      type: 'button',
      'aria-label': `Remove ${item.name} from cart`,
    },
    text: '🗑️',
  });

  priceWrapper.append(subtotal, removeButton);

  // Add class when discounted
  if (item.discountedPrice !== undefined) {
    subtotal.classList.add('has-discount');
  }
  qtyWrapper.append(priceWrapper);

  // Event handlers with loading states
  const updateQuantity = (newQty: number) => {
    if (newQty <= 1) {
      minus.setAttribute('disabled', '');
    } else {
      minus.removeAttribute('disabled');
    }

    // Add updating state
    root.classList.add('updating');
    qtyDisplay.textContent = String(newQty);
    subtotal.textContent = format(item.price * newQty);

    // Update disabled state for minus button
    // minus.setAttribute('disabled', newQty <= 1 ? 'true' : '');

    actions.onQuantityChange(newQty);

    // Remove updating state after a short delay
    setTimeout(() => {
      root.classList.remove('updating');
    }, 500);
  };

  minus.addEventListener('click', (event) => {
    event.preventDefault();
    if (item.quantity > 1) {
      updateQuantity(item.quantity - 1);
    }
  });

  plus.addEventListener('click', (event) => {
    event.preventDefault();
    updateQuantity(item.quantity + 1);
  });

  removeButton.addEventListener('click', (event) => {
    event.preventDefault();

    // Add fade out animation
    root.style.transition = 'all 0.3s ease';
    root.style.opacity = '0.5';
    root.style.transform = 'scale(0.95)';

    // Confirm removal for accessibility
    // if (confirm(`Remove ${item.name} from your cart?`)) {
    actions.onRemove();
    // } else {
    //   // Restore if cancelled
    root.style.opacity = '1';
    root.style.transform = 'scale(1)';
    // }
  });

  // Add keyboard navigation support
  for (const button of [minus, plus, removeButton]) {
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
      }
    });
  }

  return root;
}

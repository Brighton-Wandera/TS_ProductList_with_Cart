/**
 * Typed version of your product-list + cart script.
 * Uses defensive null checks and proper DOM typings so TypeScript compiles cleanly.
 */

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | undefined;
};

function q<K extends keyof HTMLElementTagNameMap>(selector: string, parent: ParentNode = document): HTMLElement | null {
  return parent.querySelector(selector) as HTMLElement | null;
}

document.addEventListener('DOMContentLoaded', () => {
  const cartSection = q('.card10');
  const productGrid = q('.product');
  const modalOverlay = q('.modal-overlay');
  const startNewOrderBtn = q('.start-new-order-btn');

  if (!cartSection || !productGrid || !modalOverlay || !startNewOrderBtn) {
    // If required elements are missing, just stop; avoids runtime errors.
    console.warn('Required DOM elements for cart functionality are missing.');
    return;
  }

  let cart: CartItem[] = [];

  // --- Event Listener for Product Grid (Add/Increment/Decrement) ---
  productGrid.addEventListener('click', (e: MouseEvent) => {
    const target = (e.target as HTMLElement)?.closest('button') as HTMLButtonElement | null;
    if (!target) return;

    const card = target.closest('.card') as HTMLElement | null;
    if (!card) return;

    const idEl = card.querySelector('.cart-name');
    const cardId = idEl?.textContent?.trim();
    if (!cardId) return;

    const itemInCart = cart.find(item => item.id === cardId);

    if (target.classList.contains('increment-btn')) {
      if (itemInCart) {
        itemInCart.quantity++;
        updateButtonState(card, itemInCart.quantity);
        updateCart();
      }
    } else if (target.classList.contains('decrement-btn')) {
      if (itemInCart) {
        itemInCart.quantity--;
        if (itemInCart.quantity === 0) {
          cart = cart.filter(cartItem => cartItem.id !== cardId);
          resetButtonState(card);
        } else {
          updateButtonState(card, itemInCart.quantity);
        }
        updateCart();
      }
    } else { // Handles the initial "Add to Cart" click
      if (!itemInCart) {
        addToCart(card);
        updateButtonState(card, 1);
      }
    }
  });

  // --- Event Listener for Cart Section (Remove/Confirm) ---
  cartSection.addEventListener('click', (e: MouseEvent) => {
    const removeBtn = (e.target as HTMLElement)?.closest('.remove-item-btn') as HTMLButtonElement | null;
    if (removeBtn) {
      const productId = removeBtn.dataset.id;
      if (!productId) return;
      const productInGrid = findProductCardById(productId);

      cart = cart.filter(item => item.id !== productId);

      if (productInGrid) resetButtonState(productInGrid);
      updateCart();
      return;
    }

    if ((e.target as HTMLElement).classList.contains('confirm-order-btn')) {
      showConfirmationModal();
    }
  });

  const addToCart = (productCard: HTMLElement) => {
    const id = productCard.querySelector('.cart-name')?.textContent?.trim();
    if (!id) return;
    const productPriceText = productCard.querySelector('.card-price')?.textContent ?? '';
    const productPrice = parseFloat(productPriceText.replace('$', '')) || 0;
    const imgEl = productCard.querySelector('img') as HTMLImageElement | null;
    const productImage = imgEl?.src ? imgEl.src.replace('-desktop', '') : undefined;

    const productName = id;

    cart.push({ id, name: productName, price: productPrice, quantity: 1, image: productImage });
    updateCart();
  };

  const updateButtonState = (productCard: HTMLElement, quantity: number) => {
    let quantitySelector = productCard.querySelector('.quantity-selector') as HTMLElement | null;

    if (!quantitySelector) {
      const btn = productCard.querySelector('.button') as HTMLElement | null;
      if (btn) btn.style.display = 'none';

      quantitySelector = document.createElement('div');
      quantitySelector.classList.add('quantity-selector');
      quantitySelector.innerHTML = `\
        <button class="decrement-btn"><img src="https://raw.githubusercontent.com/danielphilipjohnson/product-list-with-cart-vanilla-js/main/images/icon-decrement-quantity.svg" alt="Decrement"></button>\
        <span class="quantity-text">${quantity}</span>\
        <button class="increment-btn"><img src="https://raw.githubusercontent.com/danielphilipjohnson/product-list-with-cart-vanilla-js/main/images/icon-increment-quantity.svg" alt="Increment"></button>\
      `;
      productCard.appendChild(quantitySelector);
    } else {
      const qt = quantitySelector.querySelector('.quantity-text');
      if (qt) qt.textContent = String(quantity);
    }
  };

  const resetButtonState = (productCard: HTMLElement) => {
    const quantitySelector = productCard.querySelector('.quantity-selector') as HTMLElement | null;
    if (quantitySelector) quantitySelector.remove();
    const btn = productCard.querySelector('.button') as HTMLElement | null;
    if (btn) btn.style.display = 'block';
  };

  const findProductCardById = (productId: string): HTMLElement | null => {
    const allProductCards = document.querySelectorAll('.card');
    for (const card of Array.from(allProductCards) as HTMLElement[]) {
      const nameEl = card.querySelector('.cart-name');
      if (nameEl?.textContent?.trim() === productId) return card;
    }
    return null;
  };

  const updateCart = () => {
    const cartContent = cartSection.querySelector('.cart') as HTMLElement | null;
    if (cart.length === 0) {
      const targetElement = cartContent || cartSection;
      targetElement.innerHTML = `\
        <h3>Your Cart (0)</h3>\
        <img src="https://raw.githubusercontent.com/danielphilipjohnson/product-list-with-cart-vanilla-js/main/images/illustration-empty-cart.svg" alt="Empty cart illustration" class="empty-cart-img">\
        <p>Your added items will appear here</p>\
      `;
      return;
    }

    let totalItems = 0;
    let totalPrice = 0;

    const cartItemsHtml = cart.map(item => {
      totalItems += item.quantity;
      totalPrice += item.price * item.quantity;
      return `\
        <div class="cart-item">\
          <div class="item-details">\
            <p class="item-name">${item.name}</p>\
            <div class="item-pricing">\
              <span class="item-quantity">${item.quantity}x</span>\
              <span class="item-price-per">@ $${item.price.toFixed(2)}</span>\
              <span class="item-price-total">$${(item.price * item.quantity).toFixed(2)}</span>\
            </div>\
          </div>\
          <button class="remove-item-btn" data-id="${item.id}">\
            <img src="https://raw.githubusercontent.com/danielphilipjohnson/product-list-with-cart-vanilla-js/main/images/icon-remove-item.svg" alt="Remove item">\
          </button>\
        </div>\
      `;
    }).join('');

    cartSection.innerHTML = `\
      <h3>Your Cart (${totalItems})</h3>\
      <div class="cart-items-container">${cartItemsHtml}</div>\
      <div class="order-total-container">\
        <span>Order Total</span>\
        <span class="total-price">$${totalPrice.toFixed(2)}</span>\
      </div>\
      <div class="carbon-neutral-container">\
        <img src="https://raw.githubusercontent.com/danielphilipjohnson/product-list-with-cart-vanilla-js/main/images/icon-carbon-neutral.svg" alt="Carbon neutral">\
        <p>This is a <strong>carbon-neutral</strong> delivery</p>\
      </div>\
      <button class="confirm-order-btn">Confirm Order</button>\
    `;
  };

  const showConfirmationModal = () => {
    const modalSummaryContainer = modalOverlay.querySelector('.modal-order-summary') as HTMLElement | null;
    const modalTotalPriceElement = modalOverlay.querySelector('.modal-total-price') as HTMLElement | null;
    if (!modalSummaryContainer || !modalTotalPriceElement) return;

    let totalPrice = 0;

    const modalItemsHtml = cart.map(item => {
      const itemTotal = item.price * item.quantity;
      totalPrice += itemTotal;
      return `\
        <div class="modal-cart-item">\
          <div class="modal-item-info">\
            <img src="${item.image ?? ''}" alt="${item.name}">\
            <div class="modal-item-details">\
              <p class="item-name">${item.name}</p>\
              <div class="item-pricing">\
                <span class="item-quantity">${item.quantity}x</span>\
                <span class="item-price-per">@ $${item.price.toFixed(2)}</span>\
              </div>\
            </div>\
          </div>\
          <span class="modal-item-total-price">$${itemTotal.toFixed(2)}</span>\
        </div>\
      `;
    }).join('');

    modalSummaryContainer.innerHTML = modalItemsHtml;
    modalTotalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    modalOverlay.style.display = 'flex';
  };

  const resetOrder = () => {
    modalOverlay.style.display = 'none';
    cart = [];

    const allProductCards = document.querySelectorAll('.card') as NodeListOf<HTMLElement>;
    allProductCards.forEach(card => resetButtonState(card));

    updateCart();
  };

  startNewOrderBtn.addEventListener('click', resetOrder);
});

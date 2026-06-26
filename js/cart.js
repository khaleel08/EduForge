import { supabase } from './supabase.js'

const ACCENT = '#0000FF'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

const cartContainer = document.getElementById('cartContainer')
const cartTotal     = document.getElementById('cartTotal')

loadCart()

async function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || []

  if (cart.length === 0) {
    showEmptyState()
    return
  }

  const ids = cart.map(item => item.id)

  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .in('id', ids)

  if (error) {
    console.error(error)
    cartContainer.innerHTML = `
      <p style="
        text-align: center;
        color: #9ca3af; font-size: 14px; padding: 2rem 0;
        font-family: ${FONT};
      ">Unable to load your cart. Please try again.</p>
    `
    return
  }

  displayCart(books)
}

function showEmptyState() {
  if (cartTotal) cartTotal.innerHTML = ''

  cartContainer.innerHTML = `
    <div style="
      text-align: center;
      padding: 3rem 1rem;
      font-family: ${FONT};
    ">
      <img
        src="assets/empty_cart.png"
        alt="Empty cart"
        style="width: 120px; margin: 0 auto 20px; display: block; opacity: 0.85;"
      >
      <p style="
        font-size: 17px; font-weight: 600;
        color: #111827; margin: 0 0 8px;
      ">Your cart is empty</p>
      <p style="
        font-size: 13px; color: #9ca3af;
        margin: 0 0 24px; line-height: 1.6;
      ">Start adding books to your cart to see them here.</p>
      <a href="browse.html" style="
        display: inline-block;
        background: ${ACCENT}; color: #ffffff;
        text-decoration: none;
        font-size: 13px; font-weight: 500;
        padding: 10px 24px; border-radius: 8px;
        transition: opacity 0.15s ease;
      "
      onmouseover="this.style.opacity='0.85'"
      onmouseout="this.style.opacity='1'">
        Browse Books
      </a>
    </div>
  `
}

function renderCartItem(book) {
  const cover = book.cover_image
    ? `<img src="${book.cover_image}" alt="${book.title}" style="
        width: 100%; height: 100%;
        object-fit: cover; display: block;
      ">`
    : `<div style="
        width: 100%; height: 100%;
        background: #eeeaf4;
        display: flex; align-items: center;
        justify-content: center;
        padding: 8px; box-sizing: border-box;
      ">
        <span style="
          font-family: Georgia, serif;
          font-size: 10px; font-weight: 600;
          color: #7b6dbf; text-align: center; line-height: 1.4;
        ">${book.title}</span>
      </div>`

  return `
    <div style="
      display: flex;
      align-items: center;
      gap: 16px;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      padding: 16px;
      font-family: ${FONT};
      transition: transform 0.18s ease, border-color 0.18s ease;
    "
    onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='#d1d5db'"
    onmouseout="this.style.transform='translateY(0)';this.style.borderColor='#e5e7eb'">

      <div style="
        width: 70px; height: 96px;
        flex-shrink: 0;
        border-radius: 6px;
        overflow: hidden;
        background: #eeeaf4;
      ">
        ${cover}
      </div>

      <div style="flex: 1; min-width: 0;">
        <p style="
          font-family: Georgia, serif;
          font-size: 14px; font-weight: 600;
          color: #111827; margin: 0 0 4px; line-height: 1.35;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        ">${book.title}</p>

        <p style="
          font-size: 12px; color: #6b7280;
          margin: 0 0 10px;
        ">${book.author || ''}</p>

        <p style="
          font-size: 14px; font-weight: 700;
          color: ${ACCENT}; margin: 0;
        ">₦${Number(book.price).toLocaleString()}</p>
      </div>

      <button
        class="remove-btn"
        data-id="${book.id}"
        style="
          flex-shrink: 0;
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #fecdd3;
          font-family: ${FONT};
          font-size: 12px; font-weight: 500;
          padding: 7px 14px; border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        "
        onmouseover="this.style.background='#ffe4e6';this.style.borderColor='#fda4af'"
        onmouseout="this.style.background='#fff1f2';this.style.borderColor='#fecdd3'"
      >
        Remove
      </button>

    </div>
  `
}

function displayCart(books) {
  let total = 0
  books.forEach(book => { total += Number(book.price) })

  cartContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
  `

  cartContainer.innerHTML = books.map(renderCartItem).join('')

  if (cartTotal) {
    cartTotal.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        padding: 20px 0 0;
        border-top: 1px solid #e5e7eb;
        font-family: ${FONT};
      ">
        <p style="
          font-size: 15px; font-weight: 600;
          color: #111827; margin: 0;
        ">
          Total:
          <span style="color: ${ACCENT}; margin-left: 4px;">
            ₦${total.toLocaleString()}
          </span>
        </p>

        <a href="checkout.html" style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: ${ACCENT}; color: #ffffff;
          text-decoration: none;
          font-size: 13px; font-weight: 500;
          padding: 10px 22px; border-radius: 8px;
          transition: opacity 0.15s ease;
        "
        onmouseover="this.style.opacity='0.85'"
        onmouseout="this.style.opacity='1'">
          Checkout
        </a>
      </div>
      
    `
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    removeFromCart(e.target.dataset.id)
  }
})

function removeFromCart(id) {
  let cart = JSON.parse(localStorage.getItem('cart')) || []
  cart = cart.filter(item => item.id !== id)
  localStorage.setItem('cart', JSON.stringify(cart))
  loadCart()
}
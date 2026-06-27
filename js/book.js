import { supabase } from './supabase.js'

const ACCENT = '#0000FF'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

const params = new URLSearchParams(window.location.search)
const bookId = params.get('id')
const bookDetails = document.getElementById('bookDetails')

async function loadBook() {
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single()

  if (error) {
    console.error(error)
    bookDetails.innerHTML = `
      <p style="
        font-family: ${FONT};
        font-size: 14px; color: #dc2626; padding: 2rem 0;
      ">Book not found.</p>
    `
    return
  }

  displayBook(book)
}

function displayBook(book) {
  const cover = book.cover_image
    ? `<img src="${book.cover_image}" alt="${book.title}" style="
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover; display: block;
      ">`
    : `<div style="
        position: absolute; inset: 0;
        display: flex; align-items: center; justify-content: center;
        padding: 24px; box-sizing: border-box;
      ">
        <span style="
          font-family: ${FONT};
          font-size: 16px; font-weight: 600;
          color: #7b6dbf; text-align: center; line-height: 1.4;
        ">${book.title}</span>
      </div>`

  bookDetails.innerHTML = `
    <div style="
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 40px;
      align-items: start;
      font-family: ${FONT};
    ">

      <!-- Cover -->
      <div>
        <div style="
          position: relative;
          width: 100%; padding-top: 133%;
          border-radius: 12px;
          overflow: hidden;
          background: #eeeaf4;
        ">${cover}</div>
      </div>

      <!-- Details -->
      <div style="display: flex; flex-direction: column;">

        ${book.category ? `
        <span style="
          display: inline-block; align-self: flex-start;
          background: #eeeaf4; color: #5b4fcf;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 20px;
          margin-bottom: 14px;
        ">${book.category}</span>` : ''}

        <h1 style="
          font-size: 26px; font-weight: 500;
          color: #111827; margin: 0 0 8px; line-height: 1.25;
        ">${book.title}</h1>

        <p style="
          font-size: 14px; color: #6b7280; margin: 0 0 20px;
        ">By ${book.author}</p>

        <hr style="
          border: none; border-top: 1px solid #e5e7eb; margin: 0 0 20px;
        ">

        <p style="
          font-size: 28px; font-weight: 500;
          color: ${ACCENT}; margin: 0 0 16px;
        ">₦${Number(book.price).toLocaleString('en-NG')}</p>

        ${book.description ? `
        <p style="
          font-size: 14px; color: #374151;
          line-height: 1.75; margin: 0 0 28px;
        ">${book.description}</p>` : ''}

        <div style="display: flex; gap: 12px;">

          <button id="addToCartBtn" style="
            flex: 1;
            display: flex; align-items: center;
            justify-content: center; gap: 7px;
            border: 1px solid ${ACCENT};
            background: transparent;
            color: ${ACCENT};
            font-family: ${FONT};
            font-size: 14px; font-weight: 500;
            padding: 11px 0; border-radius: 8px;
            cursor: pointer; transition: background 0.15s;
          "
          onmouseover="this.style.background='#eeeaf4'"
          onmouseout="this.style.background='transparent'">
            Add to cart
          </button>

          <button id="buyNowBtn" style="
            flex: 1;
            display: flex; align-items: center;
            justify-content: center; gap: 7px;
            background: ${ACCENT};
            border: none;
            color: #ffffff;
            font-family: ${FONT};
            font-size: 14px; font-weight: 500;
            padding: 11px 0; border-radius: 8px;
            cursor: pointer; transition: opacity 0.15s;
          "
          onmouseover="this.style.opacity='0.87'"
          onmouseout="this.style.opacity='1'">
            Buy now
          </button>

        </div>
      </div>
    </div>
  `
}

document.addEventListener('click', e => {
  if (e.target.id === 'addToCartBtn') addToCart()
  if (e.target.id === 'buyNowBtn') buyNow()
})

function addToCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || []
  const exists = cart.find(item => item.id === bookId)

  if (exists) {
    alert('Book already in cart')
    return
  }

  cart.push({ id: bookId })
  localStorage.setItem('cart', JSON.stringify(cart))
  alert('Book added to cart')
}

async function buyNow() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    alert('Please sign in first')
    return
  }

  localStorage.setItem('cart', JSON.stringify([{ id: bookId }]))
  window.location.href = 'checkout.html'
}

loadBook()




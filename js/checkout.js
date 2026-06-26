import { supabase } from './supabase.js'

const PAYSTACK_PUBLIC_KEY = 'pk_test_e104afae8ddc9f3a5ce994a09f14c2164c8b3d99'
const ACCENT = '#1900ff'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

const checkoutSummary = document.getElementById('checkoutSummary')

loadCheckout()

async function loadCheckout() {
  const cart = JSON.parse(localStorage.getItem('cart')) || []

  if (cart.length === 0) {
    checkoutSummary.innerHTML = `
      <div style="
        text-align: center; padding: 3rem 1rem;
        font-family: ${FONT};
      ">
        <p style="font-size: 32px; margin: 0 0 8px;">🛒</p>
        <p style="font-size: 15px; font-weight: 500; color: #111827; margin: 0 0 6px;">Your cart is empty</p>
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 20px;">Add some books before checking out.</p>
        <a href="browse.html" style="
          display: inline-block;
          background: ${ACCENT}; color: #fff;
          text-decoration: none;
          font-size: 13px; font-weight: 500;
          padding: 9px 22px; border-radius: 8px;
        ">Browse books</a>
      </div>
    `
    return
  }

  const ids = cart.map(item => item.id)

  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .in('id', ids)

  if (error) {
    console.error(error)
    checkoutSummary.innerHTML = `
      <p style="font-family: ${FONT}; font-size: 14px; color: #dc2626; padding: 2rem 0;">
        Unable to load your cart. Please try again.
      </p>
    `
    return
  }

  displayCheckout(books)
}

function coverHTML(book) {
  if (book.cover_image) {
    return `<img src="${book.cover_image}" alt="${book.title}" style="
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover; display: block;
    ">`
  }
  return `<div style="
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    padding: 4px; box-sizing: border-box;
  ">
    <span style="
      font-family: ${FONT};
      font-size: 9px; font-weight: 500;
      color: #7b6dbf; text-align: center; line-height: 1.3;
    ">${book.title}</span>
  </div>`
}

function displayCheckout(books) {
  let total = 0
  books.forEach(book => { total += Number(book.price) })

  // inject responsive style once
  if (!document.getElementById('ef-checkout-style')) {
    const style = document.createElement('style')
    style.id = 'ef-checkout-style'
    style.textContent = `
      @media (min-width: 640px) {
        .ef-co-grid {
          display: grid !important;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          align-items: start;
        }
        .ef-items-wrap { margin-bottom: 0 !important; }
      }
    `
    document.head.appendChild(style)
  }

  const itemRows = books.map(book => `
    <div style="
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px;
      border-bottom: 1px solid #e5e7eb;
      font-family: ${FONT};
    ">
      <div style="
        position: relative; width: 42px; height: 56px;
        border-radius: 6px; background: #eeeaf4;
        flex-shrink: 0; overflow: hidden;
      ">${coverHTML(book)}</div>

      <div style="flex: 1; min-width: 0;">
        <p style="
          font-size: 13px; font-weight: 500; color: #111827;
          margin: 0 0 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        ">${book.title}</p>
        <p style="font-size: 11px; color: #6b7280; margin: 0;">${book.author}</p>
      </div>

      <span style="font-size: 13px; font-weight: 500; color: ${ACCENT}; flex-shrink: 0;">
        ₦${Number(book.price).toLocaleString('en-NG')}
      </span>
    </div>
  `).join('')

  const summaryRows = books.map(book => `
    <div style="
      display: flex; justify-content: space-between; align-items: baseline;
      font-size: 13px; color: #6b7280; margin-bottom: 7px;
      font-family: ${FONT};
    ">
      <span style="max-width: 65%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${book.title}
      </span>
      <span>₦${Number(book.price).toLocaleString('en-NG')}</span>
    </div>
  `).join('')

  checkoutSummary.innerHTML = `
    <p style="font-family:${FONT}; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:#9ca3af; font-weight:500; margin:0 0 5px;">EduForge</p>
    <h1 style="font-family:${FONT}; font-size:22px; font-weight:500; color:#111827; margin:0 0 1.25rem;">Checkout</h1>

    <div class="ef-co-grid" style="display: block;">

      <div class="ef-items-wrap" style="margin-bottom: 16px;">
        <p style="font-family:${FONT}; font-size:12px; font-weight:500; color:#6b7280; margin:0 0 8px;">
          ${books.length} item${books.length !== 1 ? 's' : ''} in your order
        </p>
        <div style="
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px; overflow: hidden;
        ">
          ${itemRows}
        </div>
      </div>

      <div>
        <p style="font-family:${FONT}; font-size:12px; font-weight:500; color:#6b7280; margin:0 0 8px;">
          Order summary
        </p>
        <div style="
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem 1.1rem;
        ">
          ${summaryRows}

          <hr style="border:none; border-top:1px solid #e5e7eb; margin:12px 0;">

          <div style="display:flex; justify-content:space-between; align-items:baseline;">
            <span style="font-family:${FONT}; font-size:15px; font-weight:500; color:#111827;">Total</span>
            <span style="font-family:${FONT}; font-size:22px; font-weight:500; color:${ACCENT};">
              ₦${total.toLocaleString('en-NG')}
            </span>
          </div>

          <button id="payBtn" style="
            display: block; width: 100%; margin-top: 14px;
            background: ${ACCENT}; color: #ffffff;
            border: none; border-radius: 8px;
            font-family: ${FONT};
            font-size: 14px; font-weight: 500;
            padding: 12px 0; cursor: pointer;
            transition: opacity 0.15s;
          "
          onmouseover="this.style.opacity='0.87'"
          onmouseout="this.style.opacity='1'">
            Proceed to payment
          </button>

          <p style="
            display:flex; align-items:center; justify-content:center; gap:5px;
            margin-top:9px; font-family:${FONT};
            font-size:11px; color:#9ca3af;
          ">🔒 Secured by Paystack</p>
        </div>
      </div>

    </div>
  `

  document.getElementById('payBtn').addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('Please sign in first')
      return
    }

    const popup = new PaystackPop()

    popup.newTransaction({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: total * 100,
      currency: 'NGN',

      onSuccess: async (transaction) => {
        for (const book of books) {

  const publisherEarning =
    Number(book.price) * 0.7

  const { error } =
    await supabase
      .from('purchases')
      .insert([{
        user_id: user.id,
        book_id: book.id,
        amount: book.price,
        payment_reference:
          transaction.reference,

        publisher_id:
          book.publisher_id,

        publisher_earning:
          publisherEarning
      }])


          if (error) {
            console.error('Purchase save error:', error)
            alert('Payment went through but failed to save purchase. Contact support.')
            return
          }
        }

        localStorage.removeItem('cart')
        alert('Payment successful!')
        window.location.href = 'library.html'
      },

      onCancel: () => {
        alert('Payment cancelled')
      }
    })
  })
}
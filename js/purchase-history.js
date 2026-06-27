import { supabase } from './supabase.js'

const ACCENT = '#0000FF'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

const container = document.getElementById('historyContainer')

loadHistory()

async function loadHistory() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`
      created_at,
      books (
        id,
        title,
        price,
        cover_image,
        pdf_url,
        publisher_name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    container.innerHTML = `
      <p style="
        text-align: center;
        color: #9ca3af; font-size: 14px; padding: 2rem 0;
        font-family: ${FONT};
      ">Unable to load your purchase history. Please try again.</p>
    `
    return
  }

  if (!purchases.length) {
    container.innerHTML = `
      <div style="
        text-align: center;
        padding: 3rem 1rem;
        font-family: ${FONT};
      ">
        <p style="font-size: 32px; margin: 0 0 12px;">🧾</p>
        <p style="
          font-size: 16px; font-weight: 600;
          color: #111827; margin: 0 0 8px;
        ">No purchases yet</p>
        <p style="
          font-size: 13px; color: #9ca3af;
          margin: 0 0 24px; line-height: 1.6;
        ">Books you buy will appear here.</p>
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
    return
  }

  // Keep only the first (most recent) purchase per book
  const seen = new Set()
  const unique = purchases.filter(item => {
    if (seen.has(item.books.id)) return false
    seen.add(item.books.id)
    return true
  })

  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
  `

  container.innerHTML = unique.map(renderHistoryItem).join('')
}

function renderHistoryItem(item) {
  const book = item.books
  const date = new Date(item.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
          margin: 0 0 6px;
        ">${book.publisher_name || ''}</p>

        <p style="
          font-size: 13px; font-weight: 700;
          color: ${ACCENT}; margin: 0 0 6px;
        ">₦${Number(book.price).toLocaleString()}</p>

        <div style="
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 5px;
          padding: 3px 8px;
        ">
          <span style="
            font-size: 11px; font-weight: 500;
            color: #16a34a; letter-spacing: 0.02em;
          ">Purchased ${date}</span>
        </div>
      </div>

      <a href="${book.pdf_url}" target="_blank" style="
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: ${ACCENT}; color: #ffffff;
        text-decoration: none;
        font-size: 12px; font-weight: 500;
        padding: 8px 14px; border-radius: 8px;
        transition: opacity 0.15s ease;
      "
      onmouseover="this.style.opacity='0.85'"
      onmouseout="this.style.opacity='1'">
        Read Book
      </a>

    </div>
  `
}
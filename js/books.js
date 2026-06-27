import { supabase } from './supabase.js'

const ACCENT = '#0000FF'


// ─── RENDER CARD ─────────────────────────────────────────────────────────────

export function renderCard(book) {
  const cover = book.cover_image
    ? `<img src="${book.cover_image}" alt="${book.title}" style="
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        position: absolute;
        top: 0; left: 0;
      ">`
    : `<div style="
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
        background: #eeeaf4;
        display: flex; align-items: center; justify-content: center;
        padding: 16px; box-sizing: border-box;
      ">
        <span style="
          font-size: 13px; font-weight: 600;
          color: #0000FF; text-align: center; line-height: 1.4;
          font-family: Georgia, serif;
        ">${book.title}</span>
      </div>`

  return `
    <a href="book.html?id=${book.id}" style="
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: transform 0.18s ease, border-color 0.18s ease;
    "
    onmouseover="this.style.transform='translateY(-4px)';this.style.borderColor='#d1d5db'"
    onmouseout="this.style.transform='translateY(0)';this.style.borderColor='#e5e7eb'">

      <div style="
        position: relative;
        width: 100%;
        padding-top: 133%;
        overflow: hidden;
        background: #eeeaf4;
        flex-shrink: 0;
      ">
        ${cover}
        <span style="
          position: absolute; top: 10px; left: 10px;
          background: ${ACCENT};
          color: #ffffff;
          font-family: -apple-system, sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px; border-radius: 4px;
        ">Featured</span>
      </div>

      <div style="
        padding: 14px 14px 16px;
        display: flex;
        flex-direction: column;
        flex: 1;
        font-family: -apple-system, 'Helvetica Neue', sans-serif;
      ">
        ${book.genre ? `
        <p style="
          font-size: 10px; letter-spacing: 0.1em;
          text-transform: uppercase; color: #9ca3af;
          margin: 0 0 5px; font-weight: 500;
        ">${book.genre}</p>` : ''}

        <p style="
          font-family: Georgia, serif;
          font-size: 14px; font-weight: 600;
          color: #111827; margin: 0 0 4px; line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">${book.title}</p>

        <p style="
          font-size: 12px; color: #6b7280; margin: 0 0 14px;
        ">${book.author}</p>

        <div style="
          display: flex; align-items: center;
          justify-content: space-between; margin-top: auto;
        ">
          <span style="
            font-size: 15px; font-weight: 500; color: ${ACCENT};
          ">₦${Number(book.price).toLocaleString('en-NG')}</span>

          <span style="
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 5px 10px;
            font-size: 11px; font-weight: 500;
            color: #6b7280; cursor: pointer;
          ">View book</span>
        </div>
      </div>
    </a>
  `
}


// ─── LOAD FEATURED BOOKS ─────────────────────────────────────────────────────

export async function loadFeaturedBooks() {

  // Guard: exit silently if container doesn't exist on this page
  const container = document.getElementById('featuredBooksContainer')
  if (!container) return

  // Show a loading state while fetching
  container.innerHTML = `
    <p style="
      text-align: center; color: #9ca3af;
      font-size: 14px; padding: 2rem 0;
      grid-column: 1 / -1;
    ">Loading books…</p>
  `

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('featured', true)

  if (error) {
    console.error('loadFeaturedBooks error:', error)
    container.innerHTML = `
      <p style="
        text-align: center; color: #9ca3af;
        font-size: 14px; padding: 2rem 0;
        grid-column: 1 / -1;
      ">Unable to load books right now. Please try again.</p>
    `
    return
  }

  if (!data || !data.length) {
    container.innerHTML = `
      <p style="
        text-align: center; color: #9ca3af;
        font-size: 14px; padding: 2rem 0;
        grid-column: 1 / -1;
      ">No featured books at the moment.</p>
    `
    return
  }

  container.style.cssText = `
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(160px, 45%), 1fr));
  gap: 12px;
`

  container.innerHTML = data.map(renderCard).join('')
}


// ─── AUTO-INIT ON DOM READY ───────────────────────────────────────────────────

// Safely call loadFeaturedBooks whether DOM is already ready or not
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFeaturedBooks)
} else {
  loadFeaturedBooks()
}
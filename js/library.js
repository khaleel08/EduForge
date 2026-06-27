import { supabase } from './supabase.js'

const ACCENT = '#0000FF'

function renderCard(item) {
  const book = item.books

  const cover = book.cover_image
    ? `<img src="${book.cover_image}" alt="${book.title}" style="
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
        object-fit: cover; display: block;
      ">`
    : `<div style="
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
        background: #eeeaf4;
        display: flex; align-items: center;
        justify-content: center;
        padding: 16px; box-sizing: border-box;
      ">
        <span style="
          font-family: Georgia, serif;
          font-size: 13px; font-weight: 600;
          color: #7b6dbf; text-align: center; line-height: 1.4;
        ">${book.title}</span>
      </div>`

  return `
    <div style="
      display: flex; flex-direction: column;
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      transition: transform 0.18s ease, border-color 0.18s ease;
    "
    onmouseover="this.style.transform='translateY(-4px)';this.style.borderColor='#d1d5db'"
    onmouseout="this.style.transform='translateY(0)';this.style.borderColor='#e5e7eb'">

      <div style="
        position: relative;
        width: 100%; padding-top: 133%;
        overflow: hidden; background: #eeeaf4;
        flex-shrink: 0;
      ">
        ${cover}
        <div style="
          position: absolute; top: 10px; right: 10px;
          background: #16a34a;
          color: #ffffff;
          font-family: -apple-system, sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 3px 8px; border-radius: 4px;
        ">Owned</div>
      </div>

      <div style="
        padding: 14px 14px 16px;
        display: flex; flex-direction: column; flex: 1;
        font-family: -apple-system, 'Helvetica Neue', sans-serif;
      ">
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
        ">${book.publisher_name}</p>

        <div style="margin-top: auto;">
          <a href="${book.pdf_url}" target="_blank" style="
            display: flex; align-items: center;
            justify-content: center; gap: 6px;
            background: ${ACCENT}; color: #ffffff;
            text-decoration: none;
            font-size: 13px; font-weight: 500;
            padding: 9px 0; border-radius: 8px;
            transition: opacity 0.15s ease;
          "
          onmouseover="this.style.opacity='0.85'"
          onmouseout="this.style.opacity='1'">
            Read book
          </a>
        </div>
      </div>
    </div>
  `
}

async function loadLibrary() {
  const container = document.getElementById('libraryContainer')

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const { data: purchases, error } = await supabase
    .from('purchases')
    .select(`*, books(*)`)
    .eq('user_id', user.id)

  if (error) {
    console.error(error)
    container.innerHTML = `
      <p style="
        grid-column: 1/-1; text-align: center;
        color: #9ca3af; font-size: 14px; padding: 2rem 0;
        font-family: -apple-system, sans-serif;
      ">Unable to load your library. Please try again.</p>
    `
    return
  }

  if (!purchases.length) {
    container.innerHTML = `
      <div style="
        grid-column: 1/-1; text-align: center;
        padding: 3rem 1rem;
        font-family: -apple-system, sans-serif;
      ">
        <p style="font-size: 32px; margin: 0 0 8px;"></p>
        <p style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 6px;">
          Your library is empty
        </p>
        <p style="font-size: 13px; color: #9ca3af; margin: 0 0 20px;">
          Books you purchase will appear here.
        </p>
        <a href="browse.html" style="
          display: inline-block;
          background: ${ACCENT}; color: #ffffff;
          text-decoration: none;
          font-size: 13px; font-weight: 500;
          padding: 9px 20px; border-radius: 8px;
        ">Browse books</a>
      </div>
    `
    return
  }

  // Keep only the first occurrence of each book to avoid duplicates
  const seen = new Set()
  const unique = purchases.filter(item => {
    if (seen.has(item.books.id)) return false
    seen.add(item.books.id)
    return true
  })

  container.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  `

  container.innerHTML = unique.map(renderCard).join('')
}

loadLibrary()

// skelenton loading
const container = document.getElementById('libraryContainer');


container.innerHTML = Array(6).fill(`
  <div class="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div class="bg-gray-200 h-64 w-full"></div>
    <div class="p-4 space-y-3">
      <div class="bg-gray-200 h-4 rounded w-3/4"></div>
      <div class="bg-gray-200 h-3 rounded w-1/2"></div>
      <div class="bg-gray-200 h-9 rounded w-full mt-2"></div>
    </div>
  </div>
`).join('');


import { supabase } from './supabase.js'

const ACCENT = '#0000FF'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

const booksContainer = document.getElementById('booksContainer')

function renderCard(book) {
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
          font-family: ${FONT};
          font-size: 13px; font-weight: 600;
          color: #0000FF; text-align: center; line-height: 1.4;
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
        width: 100%;
        padding-top: 133%;
        overflow: hidden;
        background: #eeeaf4;
        flex-shrink: 0;
      ">${cover}</div>

      <div style="
        padding: 14px 14px 16px;
        display: flex; flex-direction: column; flex: 1;
        font-family: ${FONT};
      ">
        <p style="
          font-family: ${FONT};
          font-size: 14px; font-weight: 600;
          color: #111827; margin: 0 0 4px; line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">${book.title}</p>

        <p style="
          font-family: ${FONT};
          font-size: 12px; color: #6b7280; margin: 0 0 12px;
        ">${book.author}</p>

        <div style="margin-top: auto;">
          <p style="
            font-family: ${FONT};
            font-size: 15px; font-weight: 500;
            color: ${ACCENT}; margin: 0 0 10px;
          ">&#8358;${Number(book.price).toLocaleString('en-NG')}</p>

          <a href="book.html?id=${book.id}" style="
            display: block; text-align: center;
            background: ${ACCENT}; color: #ffffff;
            text-decoration: none;
            font-family: ${FONT};
            font-size: 13px; font-weight: 500;
            padding: 9px 0; border-radius: 8px;
            transition: opacity 0.15s ease;
          "
          onmouseover="this.style.opacity='0.85'"
          onmouseout="this.style.opacity='1'">View book</a>
        </div>
      </div>
    </div>
  `
}

function displayBooks(books) {
  booksContainer.style.cssText = `
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(160px, 45%), 1fr));
  gap: 12px;
`

  if (!books.length) {
    booksContainer.innerHTML = `
      <p style="
        grid-column: 1/-1; text-align: center;
        color: #9ca3af; font-size: 14px; padding: 2rem 0;
        font-family: ${FONT};
      ">No books in this category yet.</p>
    `
    return
  }

  booksContainer.innerHTML = books.map(renderCard).join('')
}

async function loadBooks(category = 'all') {
  let query = supabase.from('books').select('*')

  if (category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: books, error } = await query

  if (error) {
    console.error(error)
    booksContainer.innerHTML = `
      <p style="
        grid-column: 1/-1; text-align: center;
        color: #9ca3af; font-size: 14px; padding: 2rem 0;
        font-family: ${FONT};
      ">Unable to load books. Please try again.</p>
    `
    return
  }

  const randomBooks = books
  .sort(() => Math.random() - 0.5)
  .slice(0, 30)

displayBooks(randomBooks)
}

// Style active category button
function setActiveButton(clickedBtn) {
  document.querySelectorAll('.category-btn').forEach(btn => {
    const isActive = btn === clickedBtn
    btn.style.background = isActive ? ACCENT : '#ffffff'
    btn.style.color = isActive ? '#ffffff' : '#6b7280'
    btn.style.borderColor = isActive ? ACCENT : '#e5e7eb'
  })
}

// Style all category buttons on page load
document.querySelectorAll('.category-btn').forEach(btn => {
  const isAll = btn.dataset.category === 'all'

  btn.style.cssText = `
    padding: 7px 16px;
    border-radius: 20px;
    border: 1px solid ${isAll ? ACCENT : '#e5e7eb'};
    background: ${isAll ? ACCENT : '#ffffff'};
    color: ${isAll ? '#ffffff' : '#6b7280'};
    font-size: 13px; font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: ${FONT};
    text-transform: capitalize;
  `

  btn.addEventListener('mouseover', () => {
    if (btn.style.background !== ACCENT && btn.style.background !== ACCENT.toLowerCase()) {
      btn.style.borderColor = '#d1d5db'
      btn.style.color = '#374151'
    }
  })

  btn.addEventListener('mouseout', () => {
    if (btn.dataset.category !== btn.closest('[data-active]')?.dataset.active) {
      const active = document.querySelector('.category-btn[data-active]')
      if (btn.style.background !== '#0000FF') {
        btn.style.borderColor = '#e5e7eb'
        btn.style.color = '#6b7280'
      }
    }
  })

  btn.addEventListener('click', () => {
    setActiveButton(btn)
    loadBooks(btn.dataset.category)
  })
})

loadBooks()


const categoryFilter =
  document.getElementById('categoryFilter')

categoryFilter.addEventListener(
  'change',
  (e) => {

    const selectedCategory =
      e.target.value

    if (selectedCategory === '') {
      loadBooks('all')
    } else {
      loadBooks(selectedCategory)
    }

  }
)




export async function loadNewReleaseBooks() {

  const container =
    document.getElementById(
      'newReleaseBooksContainer'
    )

  if (!container) {
    console.error(
      'newReleaseBooksContainer not found'
    )
    return
  }

  const { data, error } =
    await supabase
      .from('books')
      .select('*')
      .order(
        'created_at',
        { ascending: false }
      )
      .limit(18)

  if (error) {
    console.error(error)
    return
  }

  container.style.cssText = `
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(160px, 45%), 1fr));
  gap: 12px;
`

  container.innerHTML =
    data.map(renderCard).join('')
}


loadNewReleaseBooks()
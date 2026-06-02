import { supabase } from './supabase.js'

export async function loadBooks() {

  const booksContainer =
    document.getElementById('booksContainer')

  const { data: books, error } =
    await supabase
      .from('books')
      .select('*')

  if (error) {
    console.error(error)
    return
  }

  booksContainer.innerHTML =
    books.map(book => `

      <div class="bg-white rounded-xl shadow p-4">

        <img
          src="${book.cover_image}"
          alt="${book.title}"
          class="w-full h-64 object-cover rounded-lg"
        >

        <h3 class="font-bold mt-3">
          ${book.title}
        </h3>

        <p class="text-gray-500">
          ${book.author}
        </p>

        <p class="font-semibold text-blue-600 mt-2">
          ₦${book.price}
        </p>

        <button
          class="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg"
        >
          View Details
        </button>

      </div>

    `).join('')
}

loadBooks()
import { supabase }
from './supabase.js'

export async function
loadFeaturedBooks() {

  const container =
  document.getElementById(
    'featuredBooksContainer'
  )

  const { data, error } =
  await supabase
    .from('books')
    .select('*')
    .eq('featured', true)

  if (error) {
    console.log(error)
    return
  }

  container.innerHTML =
  data.map(book => `

    <div class="book-card bg-white rounded-xl shadow overflow-hidden">

      <img
        src="${book.cover_url}"
        class="w-full h-52 object-cover"
      />

      <div class="p-4">

        <h3 class="font-semibold text-lg">
          ${book.title}
        </h3>

        <p class="text-gray-500 text-sm">
          ${book.author}
        </p>

        <p class="text-blue-600 font-bold mt-2">
          ₦${book.price}
        </p>

      </div>

    </div>

  `).join('')
}
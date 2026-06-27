import { supabase } from './supabase.js'

const {
  data: { user }
} = await supabase.auth.getUser()

if (!user) {
  window.location.href = 'index.html'
}

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile.role !== 'publisher') {
  alert('Access denied. Create a publisher account to access this feature.')
  window.location.href = 'index.html'
}




// ─── UPLOAD FORM ─────────────────────────────────────────────────────────────

const uploadForm = document.getElementById('uploadForm')
let editingBookId = null

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const title       = document.getElementById('title').value
  const description = document.getElementById('description').value
  const category    = document.getElementById('category').value
  const price       = document.getElementById('price').value
  const coverFile   = document.getElementById('coverImage').files[0]
  const pdfFile     = document.getElementById('pdfFile').files[0]

  const { data: { user } } = await supabase.auth.getUser()

  // Upload cover image
  const coverFileName = Date.now() + '-' + coverFile.name

  const { error: coverError } = await supabase.storage
    .from('book-covers')
    .upload(coverFileName, coverFile)

  if (coverError) {
    console.error(coverError)
    alert('Cover image upload failed')
    return
  }

  const { data: coverData } = supabase.storage
    .from('book-covers')
    .getPublicUrl(coverFileName)

  const coverImageUrl = coverData.publicUrl

  // Upload PDF
  const pdfFileName = Date.now() + '-' + pdfFile.name

  const { error: pdfError } = await supabase.storage
    .from('book-pdfs')
    .upload(pdfFileName, pdfFile)

  if (pdfError) {
    console.error(pdfError)
    alert('PDF upload failed')
    return
  }

  const { data: pdfData } = supabase.storage
    .from('book-pdfs')
    .getPublicUrl(pdfFileName)

  const pdfUrl = pdfData.publicUrl

  // Get publisher name from profile
  const { data: publisherProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const publisherName = publisherProfile?.full_name || 'Unknown Publisher'

  // Insert book into database
  const { error: insertError } = await supabase
    .from('books')
    .insert([{
      title,
      description,
      category,
      price,
      cover_image: coverImageUrl,
      pdf_url: pdfUrl,
      publisher_id: user.id,
      publisher_name: publisherName,
      author: publisherName
    }])

  if (insertError) {
    console.error(insertError)
    alert(insertError.message)
    return
  }

  alert('Book uploaded successfully!')
  uploadForm.reset()
  loadPublisherBooks()
  loadSalesStats()
  loadSalesTable()
})




// ─── LOAD PUBLISHER BOOKS ─────────────────────────────────────────────────────

async function loadPublisherBooks() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .eq('publisher_id', user.id)

  if (error) {
    console.error(error)
    return
  }

  const container = document.getElementById('publisherBooks')

  if (!books || books.length === 0) {
    container.innerHTML = '<p class="text-gray-500 col-span-full">No books uploaded yet.</p>'
    return
  }

  container.innerHTML = books.map(book => `
    <div class="bg-white rounded-lg shadow p-4">
      <img
        src="${book.cover_image}"
        class="w-full h-60 object-cover rounded"
      >
      <h3 class="font-bold mt-3">${book.title}</h3>
      <p class="text-gray-500">${book.category}</p>
      <p class="font-semibold">₦${Number(book.price).toLocaleString()}</p>
      <div class="flex gap-2 mt-3">
        <button
          onclick="editBook('${book.id}')"
          class="flex-1 bg-blue-600 text-white py-2 rounded"
        >Edit</button>
        <button
          onclick="deleteBook('${book.id}')"
          class="flex-1 bg-red-600 text-white py-2 rounded"
        >Delete</button>
      </div>
    </div>
  `).join('')
}




// ─── DELETE BOOK + STORAGE FILES ─────────────────────────────────────────────

window.deleteBook = async function(id) {
  const confirmed = confirm('Delete this book? This cannot be undone.')
  if (!confirmed) return

  // Step 1: Fetch the book URLs before deleting anything
  const { data: book, error: fetchError } = await supabase
    .from('books')
    .select('cover_image, pdf_url')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error(fetchError)
    alert('Could not fetch book details. Delete cancelled.')
    return
  }

  // Step 2: Extract + decode file names from the public storage URLs
  const coverFileName = decodeURIComponent(book.cover_image?.split('/book-covers/')[1])
  const pdfFileName   = decodeURIComponent(book.pdf_url?.split('/book-pdfs/')[1])

  // Step 3: Delete cover image from storage bucket
  if (coverFileName) {
    const { error: coverDeleteError } = await supabase.storage
      .from('book-covers')
      .remove([coverFileName])

    if (coverDeleteError) {
      console.error(coverDeleteError)
      alert('Failed to delete cover image from storage. Delete cancelled.')
      return
    }
  }

  // Step 4: Delete PDF from storage bucket
  if (pdfFileName) {
    const { error: pdfDeleteError } = await supabase.storage
      .from('book-pdfs')
      .remove([pdfFileName])

    if (pdfDeleteError) {
      console.error(pdfDeleteError)
      alert('Failed to delete PDF from storage. Delete cancelled.')
      return
    }
  }

  // Step 5: Delete the database row last (after files are confirmed gone)
  const { error: dbError } = await supabase
    .from('books')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error(dbError)
    alert('Failed to delete book record from database.')
    return
  }

  loadPublisherBooks()
  loadSalesStats()
  loadSalesTable()
}




// ─── EDIT BOOK ────────────────────────────────────────────────────────────────

window.editBook = async function(id) {
  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()

  // Set editingBookId AFTER the fetch to avoid a race condition
  editingBookId = id

  document.getElementById('editTitle').value       = book.title
  document.getElementById('editDescription').value = book.description
  document.getElementById('editPrice').value       = book.price

  document.getElementById('editModal').classList.remove('hidden')
}

document.getElementById('saveEditBtn').addEventListener('click', async () => {
  const title       = document.getElementById('editTitle').value
  const description = document.getElementById('editDescription').value
  const price       = document.getElementById('editPrice').value

  const { error } = await supabase
    .from('books')
    .update({ title, description, price })
    .eq('id', editingBookId)

  if (error) {
    console.error(error)
    alert('Update failed')
    return
  }

  document.getElementById('editModal').classList.add('hidden')
  editingBookId = null

  loadPublisherBooks()
  loadSalesStats()
  loadSalesTable()

  alert('Book updated!')
})




// ─── SALES STATS ──────────────────────────────────────────────────────────────

async function loadSalesStats() {
  const { data: { user } } = await supabase.auth.getUser()

  // FIX: Fetch all books + all their purchases in two queries instead of N+1
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, price')
    .eq('publisher_id', user.id)

  if (booksError) {
    console.error(booksError)
    return
  }

  if (!books || books.length === 0) {
    document.getElementById('totalBooks').textContent   = 0
    document.getElementById('totalSales').textContent   = 0
    document.getElementById('totalRevenue').textContent = '₦0'
    return
  }

  const bookIds = books.map(b => b.id)

  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select('book_id')
    .in('book_id', bookIds)

  if (purchasesError) {
    console.error(purchasesError)
    return
  }

  // Build a sales count map by book_id
  const salesMap = {}
  for (const p of (purchases || [])) {
    salesMap[p.book_id] = (salesMap[p.book_id] || 0) + 1
  }

  const totalBooks   = books.length
  const totalSales   = purchases?.length || 0
  // FIX: parse price as a number before multiplying
  const totalRevenue = books.reduce((sum, book) => {
    const sales = salesMap[book.id] || 0
    return sum + sales * Number(book.price)
  }, 0)

  document.getElementById('totalBooks').textContent   = totalBooks
  document.getElementById('totalSales').textContent   = totalSales
  document.getElementById('totalRevenue').textContent = `₦${totalRevenue.toLocaleString()}`
}




// ─── SALES TABLE ──────────────────────────────────────────────────────────────

async function loadSalesTable() {
  const { data: { user } } = await supabase.auth.getUser()

  // FIX: Fetch all books + all purchases in two queries instead of N+1
  const { data: books, error } = await supabase
    .from('books')
    .select('id, title, price')
    .eq('publisher_id', user.id)

  if (error) {
    console.error(error)
    return
  }

  const tableBody = document.getElementById('salesTableBody')

  if (!books || books.length === 0) {
    tableBody.innerHTML = '<tr><td class="p-4 text-gray-500" colspan="3">No books yet.</td></tr>'
    return
  }

  const bookIds = books.map(b => b.id)

  const { data: purchases, error: purchasesError } = await supabase
    .from('purchases')
    .select('book_id')
    .in('book_id', bookIds)

  if (purchasesError) {
    console.error(purchasesError)
    return
  }

  // Build a sales count map by book_id
  const salesMap = {}
  for (const p of (purchases || [])) {
    salesMap[p.book_id] = (salesMap[p.book_id] || 0) + 1
  }

  tableBody.innerHTML = books.map(book => {
    const sales   = salesMap[book.id] || 0
    // FIX: parse price as a number before multiplying
    const revenue = sales * Number(book.price)
    return `
      <tr class="border-t">
        <td class="p-4">${book.title}</td>
        <td class="p-4">${sales}</td>
        <td class="p-4">₦${revenue.toLocaleString()}</td>
      </tr>
    `
  }).join('')
}



loadPublisherBooks()
loadSalesStats()
loadSalesTable()
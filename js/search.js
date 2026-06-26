import { supabase } from './supabase.js'

export async function searchBooks(query) {

  const { data, error } =
  await supabase
    .from('books')
    .select('*')
    .or(
      `title.ilike.%${query}%,author.ilike.%${query}%,publisher_name.ilike.%${query}%,category.ilike.%${query}%`
    )

  if (error) {
    console.error(error)
    return []
  }

  return data || []
}
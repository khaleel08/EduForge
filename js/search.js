import { supabase }
from './supabase.js'

export async function searchBooks(query) {

  const { data, error } =
  await supabase
    .from('books')
    .select('*')
    .ilike('title', `%${query}%`)

  return data || []
}
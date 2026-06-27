import { supabase }
from './supabase.js'

export async function signUp(
  name,
  email,
  password,
  role
) {

  const { data, error } =
  await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return
  }

  const {
    error: profileError
  } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      full_name: name,
      email,
      role
    })

  console.log(
    'PROFILE ERROR:',
    profileError
  )

  if (profileError) {
    alert(profileError.message)
  }

  alert('Account created successfully!')
}

export async function signIn(
  email,
  password
) {

  const { data, error } =
  await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return
  }

  return data.user
}

export async function logout() {
  await supabase.auth.signOut()
}




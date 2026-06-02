// ================================================================
// main.js — Eduforge
// ================================================================

import { signUp, signIn, logout } from './auth.js'
import { loadFeaturedBooks }      from './books.js'
import { searchBooks }            from './search.js'
import { supabase }               from './supabase.js'

lucide.createIcons()

loadFeaturedBooks()

// --- Auth modal ---
const authModal    = document.getElementById('authModal')
const modalTitle   = document.getElementById('modalTitle')
const nameInput    = document.getElementById('nameInput')
const roleInput    = document.getElementById('roleInput')

// --- Desktop nav elements ---
const authButtons  = document.getElementById('authButtons')   // sign in / sign up buttons
const userMenu     = document.getElementById('userMenu')       // avatar + dropdown wrapper
const userMenuBtn  = document.getElementById('userMenuBtn')   // avatar circle button
const userDropdown = document.getElementById('userDropdown')  // dropdown panel

// --- Mobile nav elements ---
const mobileAuthButtons    = document.getElementById('mobileAuthButtons')    // sign in / sign up buttons
const mobileAvatarBtn      = document.getElementById('mobileAvatarBtn')      // avatar circle button
const mobileAvatarDropdown = document.getElementById('mobileAvatarDropdown') // dropdown panel
const mobileSearch         = document.getElementById('mobileSearch')         // search bar below nav
const mobileSearchBtn      = document.getElementById('mobileSearchBtn')      // search icon button
const mobileMenu           = document.getElementById('mobileMenu')           // slide-out sidebar
const mobileMenuBtn        = document.getElementById('mobileMenuBtn')        // hamburger button
const mobileMenuOverlay    = document.getElementById('mobileMenuOverlay')    // dark overlay

// --- Desktop dropdown elements ---
const categoriesBtn      = document.getElementById('categoriesBtn')
const categoriesDropdown = document.getElementById('categoriesDropdown')

// --- Search elements (desktop) ---
const searchInput    = document.getElementById('searchInput')
const searchDropdown = document.getElementById('searchDropdown')
const searchResults  = document.getElementById('searchResults')


// AUTH MODAL — open / close

// Track whether the user is signing in or signing up
let authMode = 'signin'

// Helper: open the modal and configure it for sign-in or sign-up
function openAuthModal(mode) {
  authMode = mode

  if (mode === 'signup') {
    modalTitle.innerText = 'Create Account'
    nameInput.classList.remove('hidden')  // show Full Name field
    roleInput.classList.remove('hidden')  // show Role selector
  } else {
    modalTitle.innerText = 'Sign In'
    nameInput.classList.add('hidden')     // hide Full Name field
    roleInput.classList.add('hidden')     // hide Role selector
  }

  authModal.classList.remove('hidden')   // show the modal
}

// Desktop "Sign In" button
document.getElementById('openSignin').onclick = () => openAuthModal('signin')

// Desktop "Sign Up" button
document.getElementById('openSignup').onclick = () => openAuthModal('signup')

// Mobile "Sign In" button (in the mobile top bar)
document.getElementById('mobileOpenSignin').onclick = () => openAuthModal('signin')

// Mobile "Sign Up" button (in the mobile top bar)
document.getElementById('mobileOpenSignup').onclick = () => openAuthModal('signup')

// Close modal (✕ button)
document.getElementById('closeModal').onclick = () => {
  authModal.classList.add('hidden')
}


// AUTH FORM — submission
// Handles both sign in and sign up in one form.

document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const name     = document.getElementById('nameInput').value
  const email    = document.getElementById('emailInput').value
  const password = document.getElementById('passwordInput').value
  const role     = document.getElementById('roleInput').value

  if (authMode === 'signup') {
    await signUp(name, email, password, role)
  } else {
    await signIn(email, password)
  }

  // Close the modal after submitting
  authModal.classList.add('hidden')

  // Refresh both navbars to reflect the new logged-in state
  checkUser()
})


// CHECK USER — the single source of truth for auth state

async function checkUser() {
  // Ask Supabase if there is a currently logged-in user
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // LOGGED IN — fetch the user's profile from the DB
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const fullName    = profile?.full_name || 'User'
    const email       = user.email
    const firstLetter = email.charAt(0).toUpperCase()

    // --- DESKTOP navbar ---
    authButtons.classList.add('hidden')     // hide sign in / sign up buttons
    userMenu.classList.remove('hidden')     // show avatar + dropdown

    userMenuBtn.textContent          = firstLetter
    dropdownAvatar.textContent       = firstLetter
    dropdownFullName.textContent     = fullName
    dropdownEmail.textContent        = email
    welcomeUserName.textContent      = fullName

    // --- MOBILE navbar ---
    mobileAuthButtons.classList.add('hidden')     // hide sign in / sign up buttons
    mobileAvatarBtn.classList.remove('hidden')     // show avatar circle button

    mobileAvatarBtn.textContent      = firstLetter
    mobileUserName.textContent       = fullName
    mobileUserEmail.textContent      = email

  } else {
    // LOGGED OUT — reset both navbars to their guest state

    // --- Reset DESKTOP navbar ---
    authButtons.classList.remove('hidden')  // show sign in / sign up buttons
    userMenu.classList.add('hidden')        // hide avatar + dropdown
    userDropdown.classList.add('hidden')    // make sure dropdown is closed

    // --- Reset MOBILE navbar ---
    mobileAuthButtons.classList.remove('hidden')  // show sign in / sign up buttons
    mobileAvatarBtn.classList.add('hidden')        // hide avatar circle button
    mobileAvatarDropdown.classList.add('hidden')   // make sure dropdown is closed
  }
}

// Run on page load to set the correct state immediately
checkUser()


// LOGOUT — works from both desktop and mobile buttons

// Desktop logout button (inside #userDropdown)
document.getElementById('logoutBtn').onclick = async () => {
  await logout()
  checkUser()  // refresh both navbars to show the logged-out state
}

// Mobile logout button (inside #mobileAvatarDropdown)
document.getElementById('mobileLogoutBtn').onclick = async () => {
  await logout()
  checkUser()  // refresh both navbars to show the logged-out state
}


// DESKTOP SEARCH — live search dropdown

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim()

  // Hide the dropdown if the input is empty
  if (!query) {
    searchDropdown.classList.add('hidden')
    return
  }

  // Fetch matching books and render them in the dropdown
  const books = await searchBooks(query)

  searchResults.innerHTML = books.map(book => `
    <div class="p-3 border-b hover:bg-gray-50 cursor-pointer">
      ${book.title}
    </div>
  `).join('')

  searchDropdown.classList.remove('hidden')
})


// DESKTOP — Categories dropdown toggle

if (categoriesBtn) {
  categoriesBtn.addEventListener('click', () => {
    categoriesDropdown.classList.toggle('hidden')
  })
}


// DESKTOP — User menu (avatar) dropdown toggle

if (userMenuBtn) {
  userMenuBtn.addEventListener('click', () => {
    userDropdown.classList.toggle('hidden')
  })
}


// MOBILE — Search bar toggle (below the navbar)

if (mobileSearchBtn) {
  mobileSearchBtn.addEventListener('click', () => {
    mobileSearch.classList.toggle('hidden')
  })
}


// MOBILE — Slide-out sidebar menu toggle

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden')
  })
}

// Clicking the dark overlay also closes the sidebar
if (mobileMenuOverlay) {
  mobileMenuOverlay.addEventListener('click', () => {
    mobileMenu.classList.add('hidden')
  })
}


// MOBILE — Avatar dropdown toggle

if (mobileAvatarBtn) {
  mobileAvatarBtn.addEventListener('click', () => {
    mobileAvatarDropdown.classList.toggle('hidden')
  })
}


// GLOBAL CLICK LISTENER — close dropdowns when clicking outside
// Checks all open dropdowns on every click.

document.addEventListener('click', (e) => {

  // Close the desktop categories dropdown
  if (
    categoriesBtn &&
    categoriesDropdown &&
    !categoriesBtn.contains(e.target) &&
    !categoriesDropdown.contains(e.target)
  ) {
    categoriesDropdown.classList.add('hidden')
  }

  // Close the desktop user dropdown
  if (
    userMenuBtn &&
    userDropdown &&
    !userMenuBtn.contains(e.target) &&
    !userDropdown.contains(e.target)
  ) {
    userDropdown.classList.add('hidden')
  }

  // Close the mobile avatar dropdown
  if (
    mobileAvatarBtn &&
    mobileAvatarDropdown &&
    !mobileAvatarBtn.contains(e.target) &&
    !mobileAvatarDropdown.contains(e.target)
  ) {
    mobileAvatarDropdown.classList.add('hidden')
  }

  // Close the mobile search bar
  if (
    mobileSearchBtn &&
    mobileSearch &&
    !mobileSearchBtn.contains(e.target) &&
    !mobileSearch.contains(e.target)
  ) {
    mobileSearch.classList.add('hidden')
  }

})

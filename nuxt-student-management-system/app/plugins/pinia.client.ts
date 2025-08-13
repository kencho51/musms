import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  // Ensure auth store is available on client
  if (process.client) {
    // This will initialize the store and make it available
    const authStore = useAuthStore()
    
    // Initialize from cookie if available
    const tokenCookie = useCookie('auth-token')
    if (tokenCookie.value && !authStore.token) {
      authStore.token = tokenCookie.value
      authStore.initialize()
    }
  }
}) 
export default defineNuxtPlugin(async () => {
  const { initialize } = useAuthStore()
  
  // Initialize auth state from stored token
  await initialize()
}) 
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, setRedirectPath } = useAuthStore()
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register', '/login', '/register']
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(to.path)
  
  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    // Store the intended destination
    setRedirectPath(to.fullPath)
    // Redirect to login
    return navigateTo('/auth/login')
  }
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isPublicRoute) {
    return navigateTo('/dashboard')
  }
}) 
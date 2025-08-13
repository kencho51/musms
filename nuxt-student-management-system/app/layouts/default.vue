<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Main Layout Container -->
    <div class="flex">
      <!-- Sidebar -->
      <AppSidebar 
        v-if="!isAuthPage" 
        :is-collapsed="sidebarCollapsed"
        @toggle="sidebarCollapsed = !sidebarCollapsed"
      />
      
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <AppHeader 
          v-if="!isAuthPage"
          :sidebar-collapsed="sidebarCollapsed"
          @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        />
        
        <!-- Page Content -->
        <main 
          class="flex-1 p-6"
          :class="{ 'p-0': isAuthPage }"
        >
          <div v-if="isAuthPage" class="min-h-screen">
            <slot />
          </div>
          <div v-else class="max-w-7xl mx-auto">
            <slot />
          </div>
        </main>
      </div>
    </div>
    
    <!-- Loading Overlay -->
    <AppLoading v-if="$nuxt.isHydrating" />
    
    <!-- Global Notifications -->
    <AppNotifications />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

// Reactive sidebar state
const sidebarCollapsed = ref(false)

// Detect auth pages (login, register, etc.)
const route = useRoute()
const isAuthPage = computed(() => {
  return route.path.startsWith('/auth') || 
         route.path === '/login' || 
         route.path === '/register'
})

// Initialize auth store on client side
const { initialize, isAuthenticated, setRedirectPath } = useAuthStore()

// Initialize auth state when component mounts
onMounted(async () => {
  await initialize()
  
  // Check if user should be redirected
  if (!isAuthenticated && !isAuthPage.value && route.path !== '/') {
    setRedirectPath(route.fullPath)
    await navigateTo('/auth/login', { replace: true })
  } else if (isAuthenticated && isAuthPage.value) {
    await navigateTo('/dashboard', { replace: true })
  }
})



// Manage sidebar state in localStorage
if (process.client) {
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    sidebarCollapsed.value = JSON.parse(savedState)
  }
  
  watch(sidebarCollapsed, (newValue) => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue))
  })
}

// Handle responsive sidebar (simple approach)
if (process.client) {
  const checkScreenSize = () => {
    if (window.innerWidth < 768) {
      sidebarCollapsed.value = true
    }
  }
  
  // Check on mount
  checkScreenSize()
  
  // Listen for resize
  window.addEventListener('resize', checkScreenSize)
  
  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
  })
}
</script>

<style scoped>
/* Additional layout-specific styles can go here */
</style> 
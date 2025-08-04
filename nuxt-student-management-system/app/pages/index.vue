<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="max-w-md w-full space-y-8">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div class="spinner mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>

        <!-- Welcome Screen -->
        <div v-else class="text-center">
          <!-- Logo -->
          <div class="flex justify-center mb-8">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Icon name="lucide:graduation-cap" class="w-8 h-8 text-white" />
            </div>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Student Management System
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-8">
            Comprehensive academic management platform
          </p>

          <!-- Action Buttons -->
          <div class="space-y-4">
            <NuxtLink 
              to="/auth/login"
              class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Sign In
            </NuxtLink>
            
            <NuxtLink 
              to="/auth/register"
              class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Create Account
            </NuxtLink>
          </div>

          <!-- Features -->
          <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div class="text-center">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Icon name="lucide:users" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p class="font-medium text-gray-900 dark:text-white">Student Management</p>
              <p class="text-gray-500 dark:text-gray-400">Manage student profiles</p>
            </div>
            
            <div class="text-center">
              <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Icon name="lucide:book-open" class="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p class="font-medium text-gray-900 dark:text-white">Course Tracking</p>
              <p class="text-gray-500 dark:text-gray-400">Monitor academic progress</p>
            </div>
            
            <div class="text-center">
              <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Icon name="lucide:bar-chart-3" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p class="font-medium text-gray-900 dark:text-white">Grade Analytics</p>
              <p class="text-gray-500 dark:text-gray-400">Comprehensive reporting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  title: 'Welcome',
  layout: false // Use no layout for landing page
})

// Simple loading state
const loading = ref(false)

// Check if user is already authenticated and redirect
onMounted(async () => {
  loading.value = true
  
  // Simple check for existing token
  const token = useCookie('auth-token')
  if (token.value) {
    // User might be authenticated, redirect to dashboard
    await navigateTo('/dashboard')
    return
  }
  
  loading.value = false
})
</script>

<style scoped>
.spinner {
  @apply w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin;
}
</style> 
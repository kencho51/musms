<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome to the Student Management System!
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <button 
            @click="logout"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Simple Welcome Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🎉 Login Successful!
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          You have successfully logged into the Student Management System. This is a simple dashboard to confirm authentication is working.
        </p>
        
        <!-- Quick Links -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 class="font-medium text-blue-900 dark:text-blue-100">Students</h3>
            <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">Manage student records</p>
          </div>
          
          <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 class="font-medium text-green-900 dark:text-green-100">Courses</h3>
            <p class="text-sm text-green-700 dark:text-green-300 mt-1">Create and manage courses</p>
          </div>
          
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 class="font-medium text-purple-900 dark:text-purple-100">Grades</h3>
            <p class="text-sm text-purple-700 dark:text-purple-300 mt-1">Record and track grades</p>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
// Meta (no middleware for testing)
definePageMeta({
  title: 'Dashboard',
  layout: false  // Don't use any layout to avoid auth store issues
})

// Simple logout function
const logout = async () => {
  // Clear token cookie
  const tokenCookie = useCookie('auth-token')
  tokenCookie.value = null
  
  // Redirect to login
  await navigateTo('/auth/login')
}

// Check if user is logged in
const token = useCookie('auth-token')
if (!token.value) {
  await navigateTo('/auth/login')
}
</script>

<style scoped>
/* Additional dashboard-specific styles can be added here */
</style> 
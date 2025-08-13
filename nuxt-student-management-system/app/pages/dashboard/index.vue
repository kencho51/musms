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

      <!-- Welcome Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🎉 Login Successful!
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Welcome {{ userInfo?.name || userInfo?.username || 'User' }}! You are logged in as {{ userInfo?.role || 'Student' }}.
        </p>
      </div>

      <!-- Admin Management Grid -->
      <div v-if="userInfo?.role === 'ADMIN'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- User Management -->
        <NuxtLink to="/users" class="block">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Manage users, roles & permissions</p>
              </div>
            </div>
            <div class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium">
              Manage Users →
            </div>
          </div>
        </NuxtLink>

        <!-- Course Management -->
        <NuxtLink to="/courses" class="block">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Course Management</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Manage courses & schedules</p>
              </div>
            </div>
            <div class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 font-medium">
              Manage Courses →
            </div>
          </div>
        </NuxtLink>

        <!-- Student Management -->
        <NuxtLink to="/students" class="block">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Student Management</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Manage student records</p>
              </div>
            </div>
            <div class="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 font-medium">
              Manage Students →
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Teacher Management Options -->
      <div v-if="userInfo?.role === 'TEACHER'" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- My Courses -->
        <NuxtLink to="/courses" class="block">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">View and manage courses</p>
              </div>
            </div>
            <div class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 font-medium">
              View Courses →
            </div>
          </div>
        </NuxtLink>

        <!-- Grade Management -->
        <NuxtLink to="/grades" class="block">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Grade Management</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Manage student grades</p>
              </div>
            </div>
            <div class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 font-medium">
              Manage Grades →
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Student View -->
      <div v-if="userInfo?.role === 'STUDENT'" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- My Courses -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">View enrolled courses</p>
            </div>
          </div>
          <div class="text-blue-600 dark:text-blue-400 font-medium">
            Coming Soon
          </div>
        </div>

        <!-- My Grades -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">My Grades</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">View academic progress</p>
            </div>
          </div>
          <div class="text-green-600 dark:text-green-400 font-medium">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
// Meta (no middleware for testing)
definePageMeta({
  title: 'Dashboard'
})

// User info
const userInfo = ref(null)
const loading = ref(true)

// Get user info
const getUserInfo = async () => {
  try {
    const token = useCookie('auth-token')
    if (!token.value) {
      await navigateTo('/auth/login')
      return
    }

    const userCookie = useCookie('user-info')
    if (userCookie.value) {
      userInfo.value = JSON.parse(userCookie.value as string)
    } else {
      // Fallback: fetch from API
      const response = await $fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      
      if (response.success) {
        userInfo.value = response.data
      }
    }
  } catch (error) {
    console.error('Failed to get user info:', error)
    await navigateTo('/auth/login')
  } finally {
    loading.value = false
  }
}

// Simple logout function
const logout = async () => {
  // Clear token cookie
  const tokenCookie = useCookie('auth-token')
  tokenCookie.value = null
  
  // Clear user info cookie
  const userCookie = useCookie('user-info')
  userCookie.value = null
  
  // Redirect to login
  await navigateTo('/auth/login')
}

// Check if user is logged in and get user info
const token = useCookie('auth-token')
if (!token.value) {
  await navigateTo('/auth/login')
} else {
  await getUserInfo()
}
</script>

<style scoped>
/* Additional dashboard-specific styles can be added here */
</style> 
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <NuxtLink to="/" class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
          <Icon name="lucide:graduation-cap" class="w-8 h-8 text-white" />
        </NuxtLink>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Or
          <NuxtLink to="/auth/register" class="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </NuxtLink>
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
            placeholder="Enter your username"
            :disabled="loading"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
            placeholder="Enter your password"
            :disabled="loading"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              :disabled="loading"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Remember me
            </label>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading || !form.username || !form.password"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="spinner mr-2"></span>
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <!-- Demo Credentials -->
      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          Demo Credentials
        </h3>
        <div class="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
          <div>👨‍💼 Admin: <code class="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">admin</code> / <code class="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">admin123</code></div>
        </div>
      </div>

      <!-- Quick Login Button -->
      <button
        @click="quickLogin"
        :disabled="loading"
        class="w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Quick Login as Admin
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  title: 'Login',
  layout: false
})

// Form state
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const loading = ref(false)

// Handle form submission
const handleLogin = async () => {
  loading.value = true
  
  try {
    console.log('Attempting login with:', { username: form.username })
    
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: form.username,
        password: form.password
      }
    })

    console.log('Login response:', response)

    if (response.success && response.data?.token) {
      // Store token in cookie
      const tokenCookie = useCookie('auth-token', {
        default: () => '',
        httpOnly: false,
        secure: false,
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      tokenCookie.value = response.data.token

      console.log('Login successful, redirecting to dashboard...')
      
      // Redirect to dashboard
      await navigateTo('/dashboard')
    } else {
      throw new Error('Invalid response from server')
    }
    
  } catch (error: any) {
    console.error('Login failed:', error)
    let errorMessage = 'Login failed. Please try again.'
    
    if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

// Quick login for demo
const quickLogin = () => {
  form.username = 'admin'
  form.password = 'admin123'
}

// Redirect if already authenticated
onMounted(() => {
  const token = useCookie('auth-token')
  if (token.value) {
    navigateTo('/dashboard')
  }
})
</script>

<style scoped>
.spinner {
  @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
}

code {
  font-family: 'JetBrains Mono', monospace;
}
</style> 
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <NuxtLink to="/" class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
          <Icon name="lucide:graduation-cap" class="w-8 h-8 text-white" />
        </NuxtLink>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </NuxtLink>
        </p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
            placeholder="Enter your full name"
            :disabled="loading"
          />
        </div>

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
            placeholder="Choose a username"
            :disabled="loading"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
            placeholder="Enter your email address"
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
            placeholder="Create a password"
            :disabled="loading"
          />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
            placeholder="Confirm your password"
            :disabled="loading"
          />
        </div>

        <div class="flex items-center">
          <input
            id="agree-terms"
            v-model="form.agreeToTerms"
            type="checkbox"
            required
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            :disabled="loading"
          />
          <label for="agree-terms" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            I agree to the Terms of Service and Privacy Policy
          </label>
        </div>

        <button
          type="submit"
          :disabled="loading || !isFormValid"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="spinner mr-2"></span>
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <!-- Note -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p class="text-sm text-blue-700 dark:text-blue-300">
          <Icon name="lucide:info" class="w-4 h-4 inline mr-1" />
          New accounts are created with Student role by default. Contact an administrator to change your role.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  title: 'Register',
  layout: false
})

// Form state
const form = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

const loading = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.name && 
         form.username && 
         form.email && 
         form.password && 
         form.confirmPassword && 
         form.agreeToTerms &&
         form.password === form.confirmPassword &&
         form.password.length >= 6
})

// Handle form submission
const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    alert("Passwords don't match")
    return
  }

  if (form.password.length < 6) {
    alert("Password must be at least 6 characters long")
    return
  }

  loading.value = true
  
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password
      }
    })

    // Store token in cookie
    const tokenCookie = useCookie('auth-token', {
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    tokenCookie.value = response.data.token

    // Store user info if needed
    const userCookie = useCookie('user-info', {
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    userCookie.value = JSON.stringify(response.data.user)

    // Redirect to dashboard
    await navigateTo('/dashboard')
    
  } catch (error: any) {
    console.error('Registration failed:', error)
    alert(error.data?.message || 'Registration failed. Please try again.')
  } finally {
    loading.value = false
  }
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
</style> 
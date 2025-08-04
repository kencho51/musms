<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Left Section: Menu Toggle & Breadcrumb -->
      <div class="flex items-center space-x-4">
        <!-- Mobile Menu Toggle -->
        <button
          @click="$emit('toggleSidebar')"
          class="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Icon name="lucide:menu" class="w-5 h-5" />
        </button>

        <!-- Breadcrumb -->
        <nav class="hidden md:flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li>
              <NuxtLink 
                to="/dashboard" 
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icon name="lucide:home" class="w-4 h-4" />
              </NuxtLink>
            </li>
            <li v-for="(item, index) in breadcrumbs" :key="index" class="flex items-center space-x-2">
              <Icon name="lucide:chevron-right" class="w-4 h-4 text-gray-400" />
              <NuxtLink 
                v-if="item.href"
                :to="item.href"
                class="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {{ item.name }}
              </NuxtLink>
              <span 
                v-else 
                class="text-sm font-medium text-gray-900 dark:text-white"
              >
                {{ item.name }}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Right Section: Search, Notifications, User Menu -->
      <div class="flex items-center space-x-4">
        <!-- Search -->
        <div class="hidden md:block relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="lucide:search" class="w-4 h-4 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @keydown.enter="handleSearch"
          >
        </div>

        <!-- Notifications -->
        <div class="relative">
          <button
            @click="showNotifications = !showNotifications"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          >
            <Icon name="lucide:bell" class="w-5 h-5" />
            <!-- Notification Badge -->
            <span 
              v-if="unreadNotifications > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <div
            v-if="showNotifications"
            v-click-outside="() => showNotifications = false"
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <div 
                v-if="notifications.length === 0"
                class="p-4 text-center text-gray-500 dark:text-gray-400"
              >
                No notifications
              </div>
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-1">
                    <p class="text-sm text-gray-900 dark:text-white">{{ notification.title }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ notification.message }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ formatTime(notification.createdAt) }}</p>
                  </div>
                  <div 
                    v-if="!notification.read"
                    class="w-2 h-2 bg-blue-500 rounded-full"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Icon 
            :name="isDark ? 'lucide:sun' : 'lucide:moon'" 
            class="w-5 h-5" 
          />
        </button>

        <!-- User Menu -->
        <div class="relative">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ user?.name?.charAt(0) || user?.username?.charAt(0) || 'U' }}
              </span>
            </div>
            <Icon name="lucide:chevron-down" class="w-4 h-4" />
          </button>

          <!-- User Dropdown -->
          <div
            v-if="showUserMenu"
            v-click-outside="() => showUserMenu = false"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ user?.name || user?.username || 'User' }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ user?.email || '' }}
              </p>
            </div>
            <div class="py-1">
              <NuxtLink
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Icon name="lucide:user" class="w-4 h-4 inline mr-2" />
                Profile
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Icon name="lucide:settings" class="w-4 h-4 inline mr-2" />
                Settings
              </NuxtLink>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Icon name="lucide:log-out" class="w-4 h-4 inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  sidebarCollapsed?: boolean
}

defineProps<Props>()
defineEmits<{
  toggleSidebar: []
}>()

// Reactive state
const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)

// Theme management
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

// Auth store
const { user, logout } = useAuthStore()

// Notifications (mock data for now)
const notifications = ref([
  {
    id: 1,
    title: 'New student registered',
    message: 'John Doe has registered for Computer Science',
    createdAt: new Date(),
    read: false
  }
])

const unreadNotifications = computed(() => 
  notifications.value.filter(n => !n.read).length
)

// Breadcrumbs
const route = useRoute()
const breadcrumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const breadcrumbs = []
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const href = i === segments.length - 1 ? null : `/${segments.slice(0, i + 1).join('/')}`
    
    breadcrumbs.push({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href
    })
  }
  
  return breadcrumbs
})

// Handlers
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
  await navigateTo('/auth/login')
}

const formatTime = (date: Date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.round((date.getTime() - Date.now()) / (1000 * 60)),
    'minute'
  )
}
</script>

<style scoped>
/* Additional header-specific styles */
</style> 
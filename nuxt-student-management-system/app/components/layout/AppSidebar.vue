<template>
  <aside 
    class="sidebar transition-all duration-300 ease-in-out"
    :class="{ 'w-16': isCollapsed, 'w-64': !isCollapsed }"
  >
    <!-- Logo/Brand -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Icon name="lucide:graduation-cap" class="w-5 h-5 text-white" />
        </div>
        <div v-if="!isCollapsed" class="flex-1">
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">SMS</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400">Student Management</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4">
      <ul class="space-y-2">
        <!-- Dashboard -->
        <li>
          <NuxtLink 
            to="/dashboard"
            class="nav-item"
            :class="{ 'nav-item-collapsed': isCollapsed }"
          >
            <Icon name="lucide:layout-dashboard" class="w-5 h-5" />
            <span v-if="!isCollapsed" class="ml-3">Dashboard</span>
          </NuxtLink>
        </li>

        <!-- Students -->
        <li>
          <NuxtLink 
            to="/students"
            class="nav-item"
            :class="{ 'nav-item-collapsed': isCollapsed }"
          >
            <Icon name="lucide:users" class="w-5 h-5" />
            <span v-if="!isCollapsed" class="ml-3">Students</span>
          </NuxtLink>
        </li>

        <!-- Courses -->
        <li>
          <NuxtLink 
            to="/courses"
            class="nav-item"
            :class="{ 'nav-item-collapsed': isCollapsed }"
          >
            <Icon name="lucide:book-open" class="w-5 h-5" />
            <span v-if="!isCollapsed" class="ml-3">Courses</span>
          </NuxtLink>
        </li>

        <!-- Grades -->
        <li>
          <NuxtLink 
            to="/grades"
            class="nav-item"
            :class="{ 'nav-item-collapsed': isCollapsed }"
          >
            <Icon name="lucide:bar-chart-3" class="w-5 h-5" />
            <span v-if="!isCollapsed" class="ml-3">Grades</span>
          </NuxtLink>
        </li>

        <!-- Divider -->
        <li v-if="!isCollapsed" class="border-t border-gray-200 dark:border-gray-700 my-4"></li>

        <!-- Admin Section (only for admin users) -->
        <template v-if="user?.role === 'admin'">
          <li v-if="!isCollapsed">
            <h3 class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Administration
            </h3>
          </li>
          
          <li>
            <NuxtLink 
              to="/users"
              class="nav-item"
              :class="{ 'nav-item-collapsed': isCollapsed }"
            >
              <Icon name="lucide:user-cog" class="w-5 h-5" />
              <span v-if="!isCollapsed" class="ml-3">User Management</span>
            </NuxtLink>
          </li>
          
          <li>
            <NuxtLink 
              to="/settings"
              class="nav-item"
              :class="{ 'nav-item-collapsed': isCollapsed }"
            >
              <Icon name="lucide:settings" class="w-5 h-5" />
              <span v-if="!isCollapsed" class="ml-3">Settings</span>
            </NuxtLink>
          </li>
        </template>
      </ul>
    </nav>

    <!-- User Profile Section -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
          <Icon name="lucide:user" class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </div>
        <div v-if="!isCollapsed" class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ user?.name || user?.username || 'User' }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ user?.role || 'Student' }}
          </p>
        </div>
      </div>
      
      <!-- Logout Button -->
      <button
        v-if="!isCollapsed"
        @click="handleLogout"
        class="mt-3 w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
      >
        <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
        Logout
      </button>
    </div>

    <!-- Collapse Toggle (Desktop) -->
    <button
      @click="$emit('toggle')"
      class="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <Icon 
        :name="isCollapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'" 
        class="w-3 h-3 text-gray-600 dark:text-gray-400" 
      />
    </button>
  </aside>
</template>

<script setup lang="ts">
interface Props {
  isCollapsed: boolean
}

defineProps<Props>()
defineEmits<{
  toggle: []
}>()

// Get current user from auth store
const { user, logout } = useAuthStore()

// Handle logout
const handleLogout = async () => {
  await logout()
}
</script>

<style scoped>
.nav-item {
  @apply flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors;
}

.nav-item.router-link-active {
  @apply bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300;
}

.nav-item-collapsed {
  @apply justify-center px-2;
}

.sidebar {
  @apply fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40;
}

@media (max-width: 768px) {
  .sidebar {
    @apply -translate-x-full;
  }
  
  .sidebar.show {
    @apply translate-x-0;
  }
}
</style> 
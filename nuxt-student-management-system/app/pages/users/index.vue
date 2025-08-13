<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage system users, roles, and permissions</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add User
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <div v-else>
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {{ (user.name || user.username).charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name || 'No Name' }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.username }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-red-100 text-red-800': user.role === 'ADMIN',
                    'bg-green-100 text-green-800': user.role === 'TEACHER',
                    'bg-blue-100 text-blue-800': user.role === 'STUDENT'
                  }"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': user.isActive,
                    'bg-red-100 text-red-800': !user.isActive
                  }"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editUser(user)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteUser(user)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ showCreateModal ? 'Add New User' : 'Edit User' }}
        </h3>
        
        <form @submit.prevent="showCreateModal ? createUser() : updateUser()">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                v-model="userForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                v-model="userForm.username"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                v-model="userForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                v-model="userForm.password"
                type="password"
                :required="showCreateModal"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                :placeholder="showEditModal ? 'Leave blank to keep current password' : ''"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                v-model="userForm.role"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                <option value="ADMIN">Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
            
            <div class="flex items-center">
              <input
                v-model="userForm.isActive"
                type="checkbox"
                id="isActive"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label for="isActive" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">Active</label>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ submitting ? 'Saving...' : (showCreateModal ? 'Create User' : 'Update User') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'User Management'
})

// Data
const users = ref([])
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingUser = ref(null)

const userForm = ref({
  name: '',
  username: '',
  email: '',
  password: '',
  role: '',
  isActive: true
})

// Fetch users
const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = useCookie('auth-token')
    if (!token.value) {
      await navigateTo('/auth/login')
      return
    }

    const response = await $fetch('/api/users', {
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (response.success) {
      users.value = response.data.users
    } else {
      error.value = response.message || 'Failed to fetch users'
    }
  } catch (err: any) {
    console.error('Fetch users error:', err)
    error.value = err.statusMessage || 'Failed to fetch users'
    
    if (err.statusCode === 401) {
      await navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// Create user
const createUser = async () => {
  submitting.value = true
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch('/api/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: userForm.value
    })

    if (response.success) {
      closeModal()
      await fetchUsers()
    } else {
      error.value = response.message || 'Failed to create user'
    }
  } catch (err: any) {
    console.error('Create user error:', err)
    error.value = err.statusMessage || 'Failed to create user'
  } finally {
    submitting.value = false
  }
}

// Edit user
const editUser = (user: any) => {
  editingUser.value = user
  userForm.value = {
    name: user.name || '',
    username: user.username,
    email: user.email,
    password: '',
    role: user.role,
    isActive: user.isActive
  }
  showEditModal.value = true
}

// Update user
const updateUser = async () => {
  if (!editingUser.value) return
  
  submitting.value = true
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/users/${editingUser.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: userForm.value
    })

    if (response.success) {
      closeModal()
      await fetchUsers()
    } else {
      error.value = response.message || 'Failed to update user'
    }
  } catch (err: any) {
    console.error('Update user error:', err)
    error.value = err.statusMessage || 'Failed to update user'
  } finally {
    submitting.value = false
  }
}

// Delete user
const deleteUser = async (user: any) => {
  if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (response.success) {
      await fetchUsers()
    } else {
      error.value = response.message || 'Failed to delete user'
    }
  } catch (err: any) {
    console.error('Delete user error:', err)
    error.value = err.statusMessage || 'Failed to delete user'
  }
}

// Close modal
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingUser.value = null
  userForm.value = {
    name: '',
    username: '',
    email: '',
    password: '',
    role: '',
    isActive: true
  }
}

// Load data on mount
onMounted(() => {
  fetchUsers()
})
</script>
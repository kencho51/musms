import { defineStore } from 'pinia'
import type { User, LoginCredentials, RegisterData, ApiResponse } from '~/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  redirectPath: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    redirectPath: null
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isTeacher: (state) => state.user?.role === 'teacher',
    isStudent: (state) => state.user?.role === 'student',
    userName: (state) => state.user?.name || state.user?.username || 'User',
    userInitials: (state) => {
      const name = state.user?.name || state.user?.username || 'U'
      return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
    }
  },

  actions: {
    // Initialize auth state from stored token
    async initialize() {
      const token = useCookie('auth-token', {
        default: () => null,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      if (token.value) {
        this.token = token.value
        try {
          await this.fetchUser()
        } catch (error) {
          // Token is invalid, clear it
          await this.logout()
        }
      }
    },

    // Login user
    async login(credentials: LoginCredentials) {
      this.loading = true
      try {
        const { data } = await $fetch<ApiResponse<{ user: User; token: string }>>('/api/auth/login', {
          method: 'POST',
          body: credentials
        })

        this.user = data.user
        this.token = data.token
        this.isAuthenticated = true

        // Store token in secure cookie
        const tokenCookie = useCookie('auth-token', {
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        tokenCookie.value = data.token

        // Redirect to intended page or dashboard
        const redirectTo = this.redirectPath || '/dashboard'
        this.redirectPath = null
        
        await navigateTo(redirectTo)
        
        // Show success notification
        const { addNotification } = useNotificationStore()
        addNotification({
          type: 'success',
          title: 'Login Successful',
          message: `Welcome back, ${this.userName}!`
        })

        return data
      } catch (error: any) {
        const { addNotification } = useNotificationStore()
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: error.data?.message || 'Invalid credentials'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    // Register new user
    async register(userData: RegisterData) {
      this.loading = true
      try {
        const { data } = await $fetch<ApiResponse<{ user: User; token: string }>>('/api/auth/register', {
          method: 'POST',
          body: userData
        })

        this.user = data.user
        this.token = data.token
        this.isAuthenticated = true

        // Store token in secure cookie
        const tokenCookie = useCookie('auth-token', {
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        tokenCookie.value = data.token

        await navigateTo('/dashboard')
        
        // Show success notification
        const { addNotification } = useNotificationStore()
        addNotification({
          type: 'success',
          title: 'Registration Successful',
          message: `Welcome to the Student Management System, ${this.userName}!`
        })

        return data
      } catch (error: any) {
        const { addNotification } = useNotificationStore()
        addNotification({
          type: 'error',
          title: 'Registration Failed',
          message: error.data?.message || 'Registration failed. Please try again.'
        })
        throw error
      } finally {
        this.loading = false
      }
    },

    // Fetch current user data
    async fetchUser() {
      if (!this.token) return

      try {
        const { data } = await $fetch<ApiResponse<User>>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.user = data
        this.isAuthenticated = true
        return data
      } catch (error) {
        // Token is invalid
        await this.logout()
        throw error
      }
    },

    // Update user profile
    async updateProfile(userData: Partial<User>) {
      if (!this.token) throw new Error('Not authenticated')

      try {
        const { data } = await $fetch<ApiResponse<User>>('/api/auth/profile', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          body: userData
        })

        this.user = data
        
        const { addNotification } = useNotificationStore()
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.'
        })

        return data
      } catch (error: any) {
        const { addNotification } = useNotificationStore()
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.data?.message || 'Failed to update profile.'
        })
        throw error
      }
    },

    // Change password
    async changePassword(currentPassword: string, newPassword: string) {
      if (!this.token) throw new Error('Not authenticated')

      try {
        await $fetch<ApiResponse>('/api/auth/change-password', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`
          },
          body: {
            currentPassword,
            newPassword
          }
        })

        const { addNotification } = useNotificationStore()
        addNotification({
          type: 'success',
          title: 'Password Changed',
          message: 'Your password has been changed successfully.'
        })
      } catch (error: any) {
        const { addNotification } = useNotificationStore()
        addNotification({
          type: 'error',
          title: 'Password Change Failed',
          message: error.data?.message || 'Failed to change password.'
        })
        throw error
      }
    },

    // Logout user
    async logout() {
      // Clear server-side session if exists
      if (this.token) {
        try {
          await $fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          })
        } catch (error) {
          // Ignore logout errors
        }
      }

      // Clear local state
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.redirectPath = null

      // Clear cookies
      const tokenCookie = useCookie('auth-token')
      tokenCookie.value = null

      // Redirect to login page
      await navigateTo('/auth/login')
    },

    // Set redirect path for after login
    setRedirectPath(path: string) {
      this.redirectPath = path
    },

    // Check if user has specific role
    hasRole(role: string | string[]): boolean {
      if (!this.user) return false
      
      if (Array.isArray(role)) {
        return role.includes(this.user.role)
      }
      
      return this.user.role === role
    },

    // Check if user has admin privileges
    hasAdminAccess(): boolean {
      return this.isAdmin
    },

    // Check if user can access specific resource
    canAccess(requiredRole: string | string[]): boolean {
      if (!this.isAuthenticated) return false
      
      // Admin can access everything
      if (this.isAdmin) return true
      
      return this.hasRole(requiredRole)
    }
  },

  // Persist state
  persist: {
    storage: persistedState.cookiesWithOptions({
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }),
    paths: ['user', 'isAuthenticated']
  }
}) 
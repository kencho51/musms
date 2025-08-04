import { defineStore } from 'pinia'
import type { Notification, NotificationType } from '~/types'

interface NotificationState {
  notifications: Notification[]
  nextId: number
}

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    nextId: 1
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
    unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    readNotifications: (state) => state.notifications.filter(n => n.read)
  },

  actions: {
    // Add a new notification
    addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
      const newNotification: Notification = {
        id: this.nextId++,
        read: false,
        createdAt: new Date(),
        ...notification
      }

      this.notifications.unshift(newNotification)

      // Auto-remove non-error notifications after 5 seconds
      if (notification.type !== 'error') {
        setTimeout(() => {
          this.removeNotification(newNotification.id)
        }, 5000)
      }

      return newNotification
    },

    // Remove a notification
    removeNotification(id: number) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
      }
    },

    // Mark notification as read
    markAsRead(id: number) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.read = true
      }
    },

    // Mark all notifications as read
    markAllAsRead() {
      this.notifications.forEach(notification => {
        notification.read = true
      })
    },

    // Clear all notifications
    clearAll() {
      this.notifications = []
    },

    // Clear read notifications
    clearRead() {
      this.notifications = this.notifications.filter(n => !n.read)
    },

    // Convenience methods for different notification types
    success(title: string, message?: string) {
      return this.addNotification({
        type: 'success',
        title,
        message
      })
    },

    error(title: string, message?: string) {
      return this.addNotification({
        type: 'error',
        title,
        message
      })
    },

    warning(title: string, message?: string) {
      return this.addNotification({
        type: 'warning',
        title,
        message
      })
    },

    info(title: string, message?: string) {
      return this.addNotification({
        type: 'info',
        title,
        message
      })
    }
  }
}) 
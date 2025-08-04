<template>
  <div class="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
    <div class="text-center">
      <div class="spinner w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple loading component - no props needed
</script>

<style scoped>
.spinner {
  @apply inline-block border-4 border-solid border-current border-t-transparent rounded-full animate-spin;
}
</style> 
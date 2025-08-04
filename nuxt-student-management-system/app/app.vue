<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Set up the page meta for the entire app
useHead({
  titleTemplate: '%s - Student Management System',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'A comprehensive Student Management System built with Nuxt 4' }
  ]
})
</script>

<style>
/* Global styles are imported via nuxt.config.ts CSS array */
</style>

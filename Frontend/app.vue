<template>
  <div id="sidos-app" class="h-screen w-screen overflow-hidden bg-foundation-page text-foreground">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en',
    class: 'dark'
  },
  bodyAttrs: {
    class: 'bg-foundation-page text-foreground'
  }
})
</script>


<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="app-wrapper">
    <AppHeader />

    <main class="app-main">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: var(--font-family-base);
  background-color: var(--color-bg);
  color: var(--color-text-primary);
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex-grow: 1;
  padding: 40px 0;
}
</style>

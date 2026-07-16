<script setup></script>

<template>
  <div class="admin-office">
    <h1 class="admin-office__title">Кабинет администратора</h1>

    <nav class="admin-office__tabs">
      <router-link class="admin-office__tab" :to="{ name: 'admin-moderation' }">
        Модерация
      </router-link>
      <router-link class="admin-office__tab" :to="{ name: 'admin-stats' }">
        Статистика
      </router-link>
    </nav>

    <div class="admin-office__content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.admin-office {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 32px var(--container-padding) 64px;
}

.admin-office__title {
  display: inline-block;
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
  margin: 0 0 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-text-primary);
}

.admin-office__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
}

.admin-office__tab {
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  text-decoration: none;
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.admin-office__tab.router-link-active {
  background-color: var(--color-navy);
  color: var(--color-text-on-dark);
  border-color: var(--color-navy);
}
</style>

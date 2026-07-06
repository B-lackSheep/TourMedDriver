<script setup></script>

<template>
  <div class="office">
    <h1 class="office__title">Личный кабинет</h1>

    <nav class="office__tabs">
      <router-link class="office__tab" :to="{ name: 'office-personal-data' }">
        Личные данные
      </router-link>
      <router-link class="office__tab" :to="{ name: 'office-cart' }"> Корзина </router-link>
      <router-link class="office__tab" :to="{ name: 'office-promocodes' }"> Промокоды </router-link>
    </nav>

    <div class="office__content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.office {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 32px var(--container-padding) 64px;
}

.office__title {
  display: inline-block;
  font-size: var(--font-size-heading);
  color: var(--color-text-primary);
  margin: 0 0 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-text-primary);
}

.office__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
}

.office__tab {
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

.office__tab.router-link-active {
  background-color: var(--color-navy);
  color: var(--color-text-on-dark);
  border-color: var(--color-navy);
}
</style>

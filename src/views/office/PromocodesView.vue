<script setup>
import { usePromocodesStore } from '@/stores/promocodes'
import { CART_CATEGORY_LABELS } from '@/stores/cart'
import { onMounted } from 'vue'

const promocodesStore = usePromocodesStore()

onMounted(() => {
  promocodesStore.fetchPromocodes()
})

function groupByCategory(order) {
  return order.items.reduce((categories, item) => {
    if (!categories[item.category]) categories[item.category] = {}
    if (!categories[item.category][item.orgName]) categories[item.category][item.orgName] = []
    categories[item.category][item.orgName].push(item)
    return categories
  }, {})
}

function isOrderFullyRedeemed(order) {
  return order.items.every((item) => item.isRedeemed)
}
</script>

<template>
  <div class="promo">
    <div
      v-for="order in promocodesStore.sortedOrders"
      :key="order.id"
      class="promo-order"
      :class="{ 'promo-order--faded': isOrderFullyRedeemed(order) }"
    >
      <p class="promo-order__header">
        Заказ #{{ order.id }}
        <span class="promo-order__date">
          <template v-if="order.time">({{ order.time }} {{ order.date }})</template>
          <template v-else>({{ order.date }})</template>
        </span>
      </p>

      <section
        v-for="(orgGroups, category) in groupByCategory(order)"
        :key="category"
        class="promo-category"
      >
        <h2 class="promo-category__title">{{ CART_CATEGORY_LABELS[category] ?? category }}</h2>

        <div v-for="(items, orgName) in orgGroups" :key="orgName" class="promo-org">
          <div class="promo-org__name">{{ orgName }}</div>

          <div class="promo-org__items">
            <div
              v-for="(item, idx) in items"
              :key="idx"
              class="promo-org__row"
              :class="{ 'promo-org__row--redeemed': item.isRedeemed }"
            >
              <span class="promo-org__service">{{ item.serviceName }}</span>
              <span class="promo-org__qty">({{ item.qty }} шт)</span>
              <span class="promo-org__price">{{ item.price ? item.price + 'р' : '' }}</span>
              <span class="promo-org__date">{{ item.date }}</span>
              <span class="promo-org__code">
                <template v-if="item.promocode">
                  Промокод: <strong>{{ item.promocode }}</strong>
                </template>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <p v-if="!promocodesStore.sortedOrders.length" class="promo__empty">
      Промокодов пока нет — они появятся после оплаты заказа
    </p>
  </div>
</template>

<style scoped>
.promo-order {
  margin-bottom: 40px;
}

.promo-order--faded .promo-order__header,
.promo-order--faded .promo-category__title,
.promo-order--faded .promo-org__name,
.promo-order--faded .promo-org__row,
.promo-order--faded .promo-org__price,
.promo-order--faded .promo-org__code strong {
  color: #a9afb8;
  border-color: #a9afb8;
}

.promo-order__header {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 20px;
}

.promo-order__date {
  margin-left: 4px;
}

.promo-category {
  margin-bottom: 20px;
}

.promo-category__title {
  display: inline-block;
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-text-primary);
  padding-bottom: 6px;
  border-bottom: 2px solid var(--color-text-primary);
  margin: 0 0 14px;
}

.promo-org {
  display: flex;
  gap: 24px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}

.promo-org:last-child {
  border-bottom: none;
}

.promo-org__name {
  width: 220px;
  flex-shrink: 0;
  font-weight: 700;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.promo-org__items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.promo-org__row {
  display: grid;
  grid-template-columns: 1fr 60px 80px 100px 180px;
  align-items: center;
  gap: 12px;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.promo-org__row--redeemed,
.promo-org__row--redeemed .promo-org__price,
.promo-org__row--redeemed .promo-org__code strong {
  color: #a9afb8;
}

.promo-org__price {
  font-weight: 600;
  color: var(--color-text-primary);
}

.promo-org__code strong {
  color: var(--color-accent-hover);
  font-weight: 700;
}

.promo__empty {
  color: var(--color-text-secondary);
}

@media (max-width: 720px) {
  .promo-org {
    flex-direction: column;
    gap: 8px;
  }

  .promo-org__name {
    width: auto;
  }

  .promo-org__row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'service qty'
      'price date'
      'code code';
    row-gap: 4px;
  }

  .promo-org__service {
    grid-area: service;
  }
  .promo-org__qty {
    grid-area: qty;
  }
  .promo-org__price {
    grid-area: price;
  }
  .promo-org__date {
    grid-area: date;
  }
  .promo-org__code {
    grid-area: code;
  }
}
</style>

<script setup>
import { useCartStore, CART_CATEGORY_LABELS } from '@/stores/cart'

const cartStore = useCartStore()
</script>

<template>
  <div class="cart">
    <div class="cart__main">
      <section
        v-for="(items, category) in cartStore.groupByCategory"
        :key="category"
        class="cart__section"
      >
        <h2 class="cart__section-title">{{ CART_CATEGORY_LABELS[category] }}</h2>

        <div v-for="item in items" :key="item.id" class="cart-item">
          <div class="cart-item__thumb">
            <img v-if="item.image" :src="item.image" :alt="item.orgName" />
          </div>

          <div class="cart-item__info">
            <div class="cart-item__org">{{ item.orgName }}</div>
            <div class="cart-item__detail">{{ item.detail }}</div>
          </div>

          <div class="cart-item__date">{{ item.date }}</div>

          <div class="cart-item__price">{{ item.price }}р</div>

          <button
            type="button"
            class="cart-item__remove"
            aria-label="Удалить из корзины"
            @click="cartStore.removeItem(item.id)"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.5625 4.125H15.125V3.4375C15.1227 2.89119 14.9047 2.3679 14.5184 1.98159C14.1321 1.59529 13.6088 1.37726 13.0625 1.375H8.9375C8.39119 1.37726 7.8679 1.59529 7.48159 1.98159C7.09529 2.3679 6.87726 2.89119 6.875 3.4375V4.125H3.4375C3.25516 4.125 3.0803 4.19743 2.95136 4.32636C2.82243 4.4553 2.75 4.63016 2.75 4.8125C2.75 4.99484 2.82243 5.1697 2.95136 5.29864C3.0803 5.42757 3.25516 5.5 3.4375 5.5H4.125V17.875C4.125 18.2397 4.26987 18.5894 4.52773 18.8473C4.78559 19.1051 5.13533 19.25 5.5 19.25H16.5C16.8647 19.25 17.2144 19.1051 17.4723 18.8473C17.7301 18.5894 17.875 18.2397 17.875 17.875V5.5H18.5625C18.7448 5.5 18.9197 5.42757 19.0486 5.29864C19.1776 5.1697 19.25 4.99484 19.25 4.8125C19.25 4.63016 19.1776 4.4553 19.0486 4.32636C18.9197 4.19743 18.7448 4.125 18.5625 4.125ZM9.625 14.4375C9.625 14.6198 9.55257 14.7947 9.42364 14.9236C9.2947 15.0526 9.11984 15.125 8.9375 15.125C8.75516 15.125 8.5803 15.0526 8.45136 14.9236C8.32243 14.7947 8.25 14.6198 8.25 14.4375V8.9375C8.25 8.75516 8.32243 8.5803 8.45136 8.45136C8.5803 8.32243 8.75516 8.25 8.9375 8.25C9.11984 8.25 9.2947 8.32243 9.42364 8.45136C9.55257 8.5803 9.625 8.75516 9.625 8.9375V14.4375ZM13.75 14.4375C13.75 14.6198 13.6776 14.7947 13.5486 14.9236C13.4197 15.0526 13.2448 15.125 13.0625 15.125C12.8802 15.125 12.7053 15.0526 12.5764 14.9236C12.4474 14.7947 12.375 14.6198 12.375 14.4375V8.9375C12.375 8.75516 12.4474 8.5803 12.5764 8.45136C12.7053 8.32243 12.8802 8.25 13.0625 8.25C13.2448 8.25 13.4197 8.32243 13.5486 8.45136C13.6776 8.5803 13.75 8.75516 13.75 8.9375V14.4375ZM13.75 4.125H8.25V3.4375C8.25 3.25516 8.32243 3.0803 8.45136 2.95136C8.5803 2.82243 8.75516 2.75 8.9375 2.75H13.0625C13.2448 2.75 13.4197 2.82243 13.5486 2.95136C13.6776 3.0803 13.75 3.25516 13.75 3.4375V4.125Z"
                fill="#A8A8A8"
              />
            </svg>
          </button>
        </div>
      </section>

      <p v-if="!cartStore.items.length" class="cart__empty">Корзина пуста</p>
    </div>

    <aside v-if="cartStore.items.length" class="cart__summary">
      <p class="cart__summary-row">
        <span>Общая сумма заказа:</span>
        <strong>{{ cartStore.totalAmount }}р</strong>
      </p>
      <small class="cart__summary-note">(оплата на месте)</small>

      <p class="cart__summary-row cart__summary-row--fee">
        <span>К оплате платформе (10%):</span>
        <strong>{{ cartStore.platformFee }}р</strong>
      </p>
      <small class="cart__summary-note">(оплата сейчас)</small>

      <button type="button" class="cart__pay-btn" @click="cartStore.payPlatformFee">
        Оплатить 10%
      </button>
    </aside>
  </div>
</template>

<style scoped>
.cart {
  display: flex;
  align-items: flex-start;
  gap: 40px;
}

.cart__main {
  flex: 1;
  min-width: 0;
}

.cart__section {
  margin-bottom: 32px;
}

.cart__section-title {
  display: inline-block;
  font-size: var(--font-size-heading);
  font-weight: 700;
  color: var(--color-text-primary);
  padding-bottom: 6px;
  border-bottom: 2px solid var(--color-text-primary);
  margin: 0 0 16px;
}

.cart-item {
  display: grid;
  grid-template-columns: 96px 1fr 130px 90px 24px;
  align-items: center;
  gap: 20px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item__thumb {
  width: 96px;
  height: 72px;
  border-radius: var(--radius-sm);
  background-color: var(--color-border);
  overflow: hidden;
}

.cart-item__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item__org {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.cart-item__detail {
  font-weight: 700;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  margin-top: 2px;
}

.cart-item__date {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.cart-item__price {
  font-weight: 700;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  text-align: right;
}

.cart-item__remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  justify-self: end;
  transition: color 0.15s ease;
}

.cart-item__remove:hover {
  color: #e5484d;
}

.cart__empty {
  color: var(--color-text-secondary);
}

.cart__summary {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
}

.cart__summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.cart__summary-row--fee {
  margin-top: 14px;
}

.cart__summary-note {
  display: block;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

.cart__pay-btn {
  width: 100%;
  margin-top: 20px;
  padding: 10px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-accent);
  color: var(--color-text-on-dark);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.cart__pay-btn:hover {
  background-color: var(--color-accent-hover);
}

@media (max-width: 720px) {
  .cart {
    flex-direction: column;
  }

  .cart__summary {
    width: 100%;
    position: static;
  }

  .cart-item {
    grid-template-columns: 72px 1fr auto;
    grid-template-areas:
      'thumb info remove'
      'thumb date price';
    row-gap: 6px;
  }

  .cart-item__thumb {
    grid-area: thumb;
  }

  .cart-item__info {
    grid-area: info;
  }

  .cart-item__remove {
    grid-area: remove;
  }

  .cart-item__date {
    grid-area: date;
  }

  .cart-item__price {
    grid-area: price;
    text-align: left;
  }
}
</style>

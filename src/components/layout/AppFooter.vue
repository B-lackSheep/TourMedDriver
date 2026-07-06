<script setup>
import AppLogo from './AppLogo.vue'
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <div class="app-footer__left">
        <nav class="app-footer__nav">
          <router-link class="app-footer__link" to="/">Каталог</router-link>
          <router-link class="app-footer__link" to="/about">О компании</router-link>
          <router-link class="app-footer__link" to="/contact">Контакты</router-link>
        </nav>

        <div class="app-footer__socials">
          <a
            href="https://vk.com"
            target="_blank"
            rel="noopener noreferrer"
            class="app-footer__social-icon"
            aria-label="Мы ВКонтакте"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_480_878)">
                <path
                  d="M15.9996 0.639893C7.51645 0.639893 0.639648 7.51669 0.639648 15.9999C0.639648 24.4831 7.51645 31.3599 15.9996 31.3599C24.4828 31.3599 31.3596 24.4831 31.3596 15.9999C31.3596 7.51669 24.4828 0.639893 15.9996 0.639893ZM21.9069 17.9695C21.9069 17.9695 23.2652 19.3103 23.5996 19.9327C23.6092 19.9455 23.614 19.9583 23.6172 19.9647C23.7532 20.1935 23.7852 20.3711 23.7181 20.5039C23.6061 20.7247 23.222 20.8335 23.0908 20.8431H20.6908C20.5245 20.8431 20.1756 20.7999 19.7532 20.5087C19.4284 20.2815 19.1084 19.9087 18.7964 19.5455C18.3308 19.0047 17.9277 18.5375 17.5212 18.5375C17.4696 18.5374 17.4183 18.5455 17.3692 18.5615C17.062 18.6607 16.6684 19.0991 16.6684 20.2671C16.6684 20.6319 16.3804 20.8415 16.1772 20.8415H15.078C14.7036 20.8415 12.7532 20.7103 11.0252 18.8879C8.91005 16.6559 7.00605 12.1791 6.99005 12.1375C6.87005 11.8479 7.11805 11.6927 7.38845 11.6927H9.81245C10.1356 11.6927 10.2412 11.8895 10.3148 12.0639C10.4012 12.2671 10.718 13.0751 11.238 13.9839C12.0812 15.4655 12.598 16.0671 13.0124 16.0671C13.0902 16.0662 13.1665 16.0464 13.2348 16.0095C13.7756 15.7087 13.6748 13.7807 13.6508 13.3807C13.6508 13.3055 13.6492 12.5183 13.3724 12.1407C13.174 11.8671 12.8364 11.7631 12.6316 11.7247C12.7145 11.6103 12.8238 11.5176 12.95 11.4543C13.3212 11.2687 13.9901 11.2415 14.654 11.2415H15.0237C15.7436 11.2511 15.9292 11.2975 16.1901 11.3631C16.7181 11.4895 16.7292 11.8303 16.6828 12.9967C16.6684 13.3279 16.6541 13.7023 16.6541 14.1439C16.6541 14.2399 16.6493 14.3423 16.6493 14.4511C16.6332 15.0447 16.614 15.7183 17.0332 15.9951C17.0879 16.0294 17.1511 16.0477 17.2157 16.0479C17.3612 16.0479 17.7996 16.0479 18.9868 14.0111C19.353 13.3555 19.6712 12.6743 19.9388 11.9727C19.9628 11.9311 20.0332 11.8031 20.1164 11.7535C20.1779 11.7222 20.2459 11.7063 20.3148 11.7071H23.1644C23.4748 11.7071 23.6876 11.7535 23.7276 11.8735C23.798 12.0639 23.7148 12.6447 22.414 14.4063L21.8333 15.1727C20.654 16.7183 20.6541 16.7967 21.9069 17.9695Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_480_878">
                  <rect width="32" height="32" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </a>

          <a
            href="https:facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            class="app-footer__social-icon"
            aria-label="Мы в Facebook"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M29.3337 16.0001C29.3337 8.64008 23.3603 2.66675 16.0003 2.66675C8.64033 2.66675 2.66699 8.64008 2.66699 16.0001C2.66699 22.4534 7.25366 27.8267 13.3337 29.0667V20.0001H10.667V16.0001H13.3337V12.6667C13.3337 10.0934 15.427 8.00008 18.0003 8.00008H21.3337V12.0001H18.667C17.9337 12.0001 17.3337 12.6001 17.3337 13.3334V16.0001H21.3337V20.0001H17.3337V29.2667C24.067 28.6001 29.3337 22.9201 29.3337 16.0001Z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </div>

      <AppLogo :size="95" to="/" />
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--color-navy);
  padding: 30px;
}

.app-footer__inner {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-footer__left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-footer__nav {
  display: flex;
  gap: var(--nav-gap);
}

.app-footer__link {
  color: var(--color-text-on-dark);
  font-size: var(--font-size-nav);
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.15s ease;
}

.app-footer__link:hover {
  opacity: 1;
}

.app-footer__socials {
  display: flex;
  gap: 10px;
}

.app-footer__social-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--color-accent);
  color: var(--color-navy);
  transition: background-color 0.15s ease;
}

.app-footer__social-icon:hover {
  background-color: var(--color-accent-hover);
}

@media (max-width: 640px) {
  .app-footer__inner {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--nav-gap);
  }
}
</style>

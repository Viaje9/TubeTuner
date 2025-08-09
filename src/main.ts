import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// PWA Service Worker 註冊
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('PWA Service Worker 註冊成功:', registration)
      })
      .catch((error) => {
        console.log('PWA Service Worker 註冊失敗:', error)
      })
  })
}

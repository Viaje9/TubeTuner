import { createRouter, createWebHashHistory } from 'vue-router'
import LocalVideoView from '@/views/LocalVideoView.vue'
import MenuView from '@/views/MenuView.vue'
import AISettingsView from '@/views/AISettingsView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import AIChatView from '@/views/AIChatView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      redirect: () => {
        // 檢查是否有儲存的使用者偏好
        try {
          const stored = localStorage.getItem('tubetuner-user-preferences')
          if (stored) {
            const preferences = JSON.parse(stored)
            const lastSelected = preferences.lastSelectedFunction

            // 如果有上次選擇的功能，直接跳轉
            switch (lastSelected) {
              case 'local':
                return { name: 'local-video' }
              case 'ai-settings':
                return { name: 'ai-settings' }
            }
          }
        } catch (error) {
          console.error('讀取使用者偏好失敗:', error)
        }

        // 預設導向功能選單
        return { name: 'menu' }
      },
    },
    {
      path: '/local-video',
      name: 'local-video',
      component: LocalVideoView,
    },
    {
      path: '/menu',
      name: 'menu',
      component: MenuView,
    },
    {
      path: '/settings/ai',
      name: 'ai-settings',
      component: AISettingsView,
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
    },
    {
      path: '/ai-chat',
      name: 'ai-chat',
      component: AIChatView,
    },
  ],
})

export default router

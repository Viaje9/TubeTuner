import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LocalVideoView from '@/views/LocalVideoView.vue'
import MenuView from '@/views/MenuView.vue'
import SearchView from '@/views/SearchView.vue'
import AISettingsView from '@/views/AISettingsView.vue'

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
              case 'youtube':
                return { name: 'youtube' }
              case 'local':
                return { name: 'local-video' }
              case 'search':
                return { name: 'search' }
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
      path: '/youtube',
      name: 'youtube',
      component: HomeView,
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
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/settings/ai',
      name: 'ai-settings',
      component: AISettingsView,
    },
  ],
})

export default router

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
      name: 'home',
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

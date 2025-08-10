import { defineStore } from 'pinia'
import { ref } from 'vue'

export type UserPreferenceFunction = 'youtube' | 'local' | 'search' | 'ai-settings'

export const useUserPreferencesStore = defineStore('userPreferences', () => {
  const lastSelectedFunction = ref<UserPreferenceFunction | null>(null)

  // 從 localStorage 載入偏好設定
  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem('tubetuner-user-preferences')
      if (stored) {
        const preferences = JSON.parse(stored)
        lastSelectedFunction.value = preferences.lastSelectedFunction || null
      }
    } catch (error) {
      console.error('載入使用者偏好設定失敗:', error)
    }
  }

  // 儲存偏好設定到 localStorage
  const savePreferences = () => {
    try {
      const preferences = {
        lastSelectedFunction: lastSelectedFunction.value,
      }
      localStorage.setItem('tubetuner-user-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('儲存使用者偏好設定失敗:', error)
    }
  }

  // 設定上次選擇的功能
  const setLastSelectedFunction = (func: UserPreferenceFunction) => {
    lastSelectedFunction.value = func
    savePreferences()
  }

  // 清除偏好設定
  const clearPreferences = () => {
    lastSelectedFunction.value = null
    localStorage.removeItem('tubetuner-user-preferences')
  }

  return {
    lastSelectedFunction,
    loadPreferences,
    savePreferences,
    setLastSelectedFunction,
    clearPreferences,
  }
})

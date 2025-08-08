<template>
  <Transition name="fade">
    <div 
      v-if="visible"
      class="fixed top-5 right-5 bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg z-50"
    >
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  message: string
  duration?: number
}>()

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(() => props.message, (newMessage) => {
  if (newMessage) {
    visible.value = true
    
    if (timer) {
      clearTimeout(timer)
    }
    
    timer = setTimeout(() => {
      visible.value = false
    }, props.duration || 3000)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
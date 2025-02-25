<script setup lang="ts">
import { useMatrix } from '../composables/useMatrix'
import LoginForm from '../components/LoginForm.vue'

const { isAuthenticated } = useMatrix()
</script>

<template>
  <main>
    <LoginForm v-if="!isAuthenticated" />
    <div v-else>
      <h2>Вы успешно вошли!</h2>
      <RouterLink to="/rooms" class="rooms-link">Перейти к списку комнат</RouterLink>
    </div>
  </main>
</template>

<style scoped>
main {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.rooms-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>

<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <div class="form-group">
      <label>Домашний сервер:</label>
      <input 
        v-model="homeserver" 
        type="text" 
        placeholder="https://matrix.org"
        required
      >
    </div>
    
    <div class="form-group">
      <label>Логин:</label>
      <input 
        v-model="username" 
        type="text" 
        required
      >
    </div>
    
    <div class="form-group">
      <label>Пароль:</label>
      <input 
        v-model="password" 
        type="password" 
        required
      >
    </div>

    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Вход...' : 'Войти' }}
    </button>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMatrix } from '../composables/useMatrix'

const { login, error } = useMatrix()

const homeserver = ref('https://matrix.org')
const username = ref('')
const password = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (isLoading.value) return

  try {
    isLoading.value = true
    await login(homeserver.value, username.value, password.value)
  } catch (e) {
    console.error('Login failed:', e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}
</style> 
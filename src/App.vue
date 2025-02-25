<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useMatrix } from './composables/useMatrix'

const { isAuthenticated, logout } = useMatrix()

const handleLogout = async () => {
  try {
    await logout()
  } catch (e) {
    console.error('Logout failed:', e)
  }
}
</script>

<template>
  <div class="app">
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  padding: 1rem;
}

nav {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

nav a {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
}

nav a:hover {
  color: var(--primary-color);
}

.logout-btn {
  padding: 8px 16px;
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.logout-btn:hover {
  opacity: 0.9;
}

main {
  flex: 1;
}
</style>

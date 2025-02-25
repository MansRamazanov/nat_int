<template>
  <div class="room-list">
    <div class="header">
      <h1>Ваши комнаты ({{ rooms.length }})</h1>
      <button @click="handleLogout" class="logout-btn">Выйти</button>
    </div>
    
    <div v-if="isLoading" class="loader-container">
      <div class="loader"></div>
      <p>Загрузка комнат...</p>
    </div>
    
    <div v-else-if="rooms.length === 0" class="no-rooms">
      Нет доступных комнат
    </div>
    
    <template v-else>
      <div class="controls">
        <select v-model="sortBy" class="sort-select">
          <option value="latest">По последнему сообщению</option>
          <option value="alpha">По алфавиту</option>
        </select>
      </div>

      <div class="rooms">
        <div 
          v-for="room in sortedRooms" 
          :key="room.id"
          class="room-item"
        >
          <img 
            v-if="room.avatarUrl" 
            :src="room.avatarUrl" 
            class="room-avatar"
            alt="Room avatar"
          >
          <div class="room-info">
            <h3>{{ room.name }}</h3>
            <p v-if="room.lastEvent" class="last-message">
              {{ getEventText(room.lastEvent) }}
            </p>
          </div>
          <div 
            v-if="room.unreadCount" 
            class="unread-badge"
          >
            {{ room.unreadCount }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMatrix } from '../composables/useMatrix'
import type { Room } from '../composables/useMatrix'
import type { MatrixEvent, RoomMember } from 'matrix-js-sdk'

const { client, logout } = useMatrix()
const rooms = ref<Room[]>([])
const sortBy = ref('latest')
const isLoading = ref(true)

const getEventText = (event: MatrixEvent) => {
  if (!event) return ''
  const content = event.getContent()
  return content.body || 'Новое сообщение'
}

const sortedRooms = computed(() => {
  return [...rooms.value].sort((a, b) => {
    if (sortBy.value === 'alpha') {
      return (a.name || a.id).localeCompare(b.name || b.id)
    } else {
      const aTime = a.lastEvent?.getTs() || 0
      const bTime = b.lastEvent?.getTs() || 0
      return bTime - aTime
    }
  })
})

const updateRooms = async () => {
  if (!client.value) return
  
  try {
    isLoading.value = true
    const matrixRooms = client.value.getRooms()
    const userId = client.value.getUserId()

    const joinedRooms = matrixRooms.filter(room => {
      const member = room.getMember(userId!)
      return member?.membership === 'join'
    })

    const processedRooms = joinedRooms.map(room => {
      const avatarEvent = room.currentState.getStateEvents('m.room.avatar', '');
      let avatarUrl = null;
      
      if (avatarEvent) {
        const mxcUrl = avatarEvent.getContent().url;
        if (mxcUrl) {
          avatarUrl = client.value!.mxcUrlToHttp(mxcUrl);
          localStorage.setItem('matrix_access_token', client.value!.getAccessToken() || '');
        }
      }

      return {
        id: room.roomId,
        name: room.name || room.roomId,
        lastEvent: room.getLiveTimeline().getEvents().slice(-1)[0] || null,
        unreadCount: room.getUnreadNotificationCount(),
        avatarUrl
      }
    })

    rooms.value = processedRooms
  } catch (e) {
    console.error('Error in updateRooms:', e)
  } finally {
    isLoading.value = false
  }
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (e) {
    console.error('Logout failed:', e)
  }
}

onMounted(() => {
  setTimeout(() => {
    if (client.value) {
      updateRooms()
      
      const events = [
        'Room.timeline',
        'Room.name',
        'sync',
        'Room.receipt'
      ]

      events.forEach(event => {
        client.value?.on(event as any, updateRooms)
      })
    }
  }, 1000)
})

onUnmounted(() => {
  const events = [
    'Room.timeline',
    'Room.name',
    'sync',
    'Room.receipt'
  ]

  events.forEach(event => {
    client.value?.removeListener(event as any, updateRooms)
  })
})

console.log(sortedRooms);

</script>

<style scoped>
.room-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.controls {
  margin-bottom: 20px;
}

.sort-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.rooms {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.room-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.room-item:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.room-info {
  flex: 1;
}

.room-info h3 {
  margin: 0;
  font-size: 16px;
}

.last-message {
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  background: #ff4444;
  color: white;
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 0 8px;
}

.no-rooms {
  text-align: center;
  padding: 20px;
  color: #666;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #f3f3f3;
  border-radius: 50%;
  border-top: 5px solid var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 
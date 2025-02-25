import { ref } from 'vue'
import type { Ref } from 'vue'
import * as sdk from 'matrix-js-sdk'
import type { MatrixClient, SyncStateData, MatrixEvent } from 'matrix-js-sdk'
import { useRouter } from 'vue-router'

export interface Room {
  id: string
  name: string
  lastEvent: MatrixEvent | null
  unreadCount: number
  avatarUrl: string | null
}

export interface MatrixState {
  client: Ref<MatrixClient | null>
  isAuthenticated: Ref<boolean>
  error: Ref<string | null>
  login: (homeserver: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export function useMatrix(): MatrixState {
  const client = ref<MatrixClient | null>(null)
  const isAuthenticated = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()

  const initClient = () => {
    const token = localStorage.getItem('matrix_token')
    const userId = localStorage.getItem('matrix_user_id')
    const baseUrl = localStorage.getItem('matrix_home_server')

    if (token && userId && baseUrl) {
      client.value = sdk.createClient({
        baseUrl,
        accessToken: token,
        userId,
        store: new sdk.MemoryStore({
          localStorage: window.localStorage
        })
      })

      client.value.startClient({ initialSyncLimit: 20 })
      isAuthenticated.value = true
    }
  }

  initClient()

  const login = async (homeserver: string, username: string, password: string) => {
    try {
      console.log('Starting login process...')
      error.value = null
      const baseUrl = homeserver.endsWith('/') ? homeserver : `${homeserver}/`
      
      const tempClient = sdk.createClient({ baseUrl })
      
      const response = await tempClient.login('m.login.password', {
        identifier: {
          type: 'm.id.user',
          user: username
        },
        password: password,
        initial_device_display_name: 'Matrix Web Client'
      })

      console.log('Login successful, got access token')
      localStorage.setItem('matrix_token', response.access_token)
      localStorage.setItem('matrix_user_id', response.user_id)
      localStorage.setItem('matrix_home_server', baseUrl)

      client.value = sdk.createClient({
        baseUrl,
        accessToken: response.access_token,
        userId: response.user_id,
        deviceId: response.device_id,
        store: new sdk.MemoryStore({
          localStorage: window.localStorage
        })
      })

      await client.value.startClient({ initialSyncLimit: 20 })
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Sync timeout'))
        }, 30000)

        const syncListener = (state: string) => {
          console.log('Sync state:', state)
          if (state === 'PREPARED') {
            clearTimeout(timeout)
            client.value?.removeAllListeners('sync')
            isAuthenticated.value = true
            resolve()
          }
        }

        client.value?.on('sync' as any, syncListener)
      })

      await router.push('/rooms')

    } catch (e) {
      console.error('Login error:', e)
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    }
  }

  const logout = async () => {
    try {
      if (client.value) {
        await client.value.logout()
        client.value.stopClient()
        client.value = null
      }
      
      localStorage.removeItem('matrix_token')
      localStorage.removeItem('matrix_user_id')
      localStorage.removeItem('matrix_home_server')
      
      isAuthenticated.value = false
      await router.push('/')
    } catch (e) {
      console.error('Logout error:', e)
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    }
  }

  return {
    client,
    isAuthenticated,
    error,
    login,
    logout
  }
} 
import io, { Socket } from 'socket.io-client'
import { toast } from 'react-hot-toast'

class SocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Function> = new Map()

  connect(token?: string) {
    // Disconnect existing connection if any
    this.disconnect()

    // Create new socket connection
    this.socket = io('/', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected')
      toast.success('Real-time updates enabled', { 
        icon: '🔗',
        position: 'bottom-right' 
      })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      toast.error('Real-time updates disconnected', { 
        icon: '🚫',
        position: 'bottom-right' 
      })
    })

    // Predefined event listeners
    this.setupDefaultListeners()

    return this
  }

  private setupDefaultListeners() {
    // Student registration notification
    this.on('student:registered', (data) => {
      toast.success(`New student registered: ${data.name}`, {
        duration: 4000,
        position: 'top-right'
      })
    })

    // Export progress
    this.on('export:progress', (progress) => {
      toast.loading(`Export progress: ${progress}%`, {
        id: 'export-progress'
      })
    })

    // Export complete
    this.on('export:complete', () => {
      toast.dismiss('export-progress')
      toast.success('Export completed successfully')
    })
  }

  // Generic event subscription
  on(event: string, callback: Function) {
    if (this.socket) {
      this.socket.on(event, callback)
      this.listeners.set(event, callback)
    }
    return this
  }

  // Emit events
  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
    return this
  }

  // Remove specific listener
  off(event: string) {
    if (this.socket) {
      const listener = this.listeners.get(event)
      if (listener) {
        this.socket.off(event, listener)
        this.listeners.delete(event)
      }
    }
    return this
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    return this
  }
}

export default new SocketService()

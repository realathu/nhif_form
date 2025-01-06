import io, { Socket } from 'socket.io-client'
import { toast } from 'react-hot-toast'

class SocketService {
  private socket: Socket | null = null

  connect() {
    this.socket = io('/') // Adjust base URL as needed

    this.socket.on('connect', () => {
      console.log('Socket connected')
    })

    this.socket.on('notification', (data) => {
      this.handleNotification(data)
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
  }

  private handleNotification(data: {
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
  }) {
    switch (data.type) {
      case 'success':
        toast.success(data.message)
        break
      case 'error':
        toast.error(data.message)
        break
      case 'warning':
        toast.error(data.message)
        break
      default:
        toast(data.message)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  // Emit custom events
  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  // Listen for specific events
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }
}

export default new SocketService()

import api from '@/lib/axios'

export interface Notification {
  id: string
  type: string
  action: string
  message: string
  data: {
    type: string
    action: string
    message: string
    peminjaman_id?: number
    pengembalian_id?: number
    alat_id?: number
    kode_peminjaman?: string
    kode_pengembalian?: string
    user_name?: string
    alat_name?: string
    kategori?: string
    stok?: number
    status?: string
  }
  read_at: string | null
  created_at: string
}

export interface NotificationResponse {
  success: boolean
  data: Notification[]
  unread_count: number
}

class NotificationService {
  async getUnreadNotifications(): Promise<NotificationResponse> {
    const response = await api.get('/notifications')
    return response.data
  }

  async getAllNotifications(page = 1): Promise<any> {
    const response = await api.get(`/notifications/all?page=${page}`)
    return response.data
  }

  async markAsRead(notificationId: string): Promise<any> {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response.data
  }

  async markAllAsRead(): Promise<any> {
    const response = await api.patch('/notifications/read-all')
    return response.data
  }

  async getUnreadCount(): Promise<{ success: boolean; unread_count: number }> {
    const response = await api.get('/notifications/unread-count')
    return response.data
  }

  async triggerPeminjamanNotification(peminjamanId: number, action: 'created' | 'dipinjam' | 'rejected' | 'returned'): Promise<any> {
    const response = await api.post('/notifications/peminjaman', {
      peminjaman_id: peminjamanId,
      action
    })
    return response.data
  }

  async triggerPengembalianNotification(pengembalianId: number, action: 'created' | 'approved' | 'rejected'): Promise<any> {
    const response = await api.post('/notifications/pengembalian', {
      pengembalian_id: pengembalianId,
      action
    })
    return response.data
  }

  async triggerAlatNotification(alatId: number, action: 'created' | 'updated' | 'deleted' | 'low_stock'): Promise<any> {
    const response = await api.post('/notifications/alat', {
      alat_id: alatId,
      action
    })
    return response.data
  }
}

export const notificationService = new NotificationService()

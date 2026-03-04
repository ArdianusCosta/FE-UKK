export interface User {
  id: number
  name: string
  role?: string
  unread_count?: number
}

export interface Message {
  id: number
  sender_id: number
  receiver_id: number
  message: string | null
  image?: string | null
  file?: string | null
  created_at: string
  updated_at: string
}
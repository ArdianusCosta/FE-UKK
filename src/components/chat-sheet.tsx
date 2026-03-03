"use client"

import * as React from "react"
import { Send, ChevronLeft, Search, Image as ImageIcon, Smile, Trash2, X } from "lucide-react"
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetTrigger,} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../../services/api.service"
import echo from "@/lib/echo"
import {Popover,PopoverContent,PopoverTrigger,} from "@/components/ui/popover"
import { User, Message } from "@/types/chat.types"

const COMMON_EMOJIS = ["😊", "😂", "🥰", "👍", "🙌", "🔥", "✨", "🙏", "❤️", "😮"]

export function ChatSheet({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [selectedContact, setSelectedContact] = React.useState<User | null>(null)
  const [newMessage, setNewMessage] = React.useState("")
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typingUsers, setTypingUsers] = React.useState<Record<number, boolean>>({})
  const typingTimeoutRef = React.useRef<Record<number, NodeJS.Timeout>>({})
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  const [userId, setUserId] = React.useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("user_id")
      return id ? parseInt(id) : null
    }
    return null
  })
  useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const data = await apiService.auth.getUser()
      if (data.id) {
        localStorage.setItem("user_id", String(data.id))
        setUserId(data.id)
      }
      return data
    },
    enabled: !userId,
  })

  const { data: contacts = [] } = useQuery<User[]>({
    queryKey: ["users-chat"],
    queryFn: () => apiService.chat.getChat(),
  })
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["messages", selectedContact?.id],
    queryFn: async () => {
      const data = await apiService.chat.getChatById(selectedContact!.id)
      return Array.isArray(data) ? data : data.data ?? []
    },
    enabled: !!selectedContact,
  })
  const sendMessageMutation = useMutation({
    mutationFn: (data: { receiver_id: number; message?: string; image?: File }) =>
      apiService.chat.kirimChat(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["messages", selectedContact?.id], (old: Message[] = []) => {
        if (old.some(m => m.id === data.id)) return old
        return [...old, data]
      })
      setNewMessage("")
      setSelectedImage(null)
      setImagePreview(null)
      queryClient.invalidateQueries({ queryKey: ["users-chat"] })
    },
  })
  const deleteMessageMutation = useMutation({
    mutationFn: (id: number) => apiService.chat.deleteMessage(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["messages", selectedContact?.id], (old: Message[] = []) => {
        return old.filter(m => m.id !== id)
      })
    },
  })

  React.useEffect(() => {
    if (!userId) return

    const channel = echo?.private(`chat.${userId}`)

    channel?.listen("MessageSent", (e: any) => {
      const msg = e.message
      if (selectedContact && (msg.sender_id === selectedContact.id || msg.receiver_id === selectedContact.id)) {
        queryClient.setQueryData(["messages", selectedContact.id], (old: Message[] = []) => {
          if (old.some(m => m.id === msg.id)) return old
          return [...old, msg]
        })
        apiService.chat.markAsRead(selectedContact.id)
      }
      queryClient.invalidateQueries({ queryKey: ["users-chat"] })
    })

    channel?.listen("MessageDeleted", (e: any) => {
      const deletedMsg = e.message
      if (selectedContact && (deletedMsg.sender_id === selectedContact.id || deletedMsg.receiver_id === selectedContact.id)) {
        queryClient.setQueryData(["messages", selectedContact.id], (old: Message[] = []) => {
          return old.filter(m => m.id !== deletedMsg.id)
        })
      }
    })

    channel?.listenForWhisper('typing', (e: any) => {
      const { user_id } = e
      setTypingUsers(prev => ({ ...prev, [user_id]: true }))
      if (typingTimeoutRef.current[user_id]) clearTimeout(typingTimeoutRef.current[user_id])
      typingTimeoutRef.current[user_id] = setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [user_id]: false }))
      }, 3000)
    })

    return () => {
      echo?.leave(`chat.${userId}`)
    }
  }, [userId, selectedContact, queryClient])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, selectedImage])

  const handleSend = () => {
    if ((!newMessage.trim() && !selectedImage) || !selectedContact) return
    sendMessageMutation.mutate({
      receiver_id: selectedContact.id,
      message: newMessage || undefined,
      image: selectedImage || undefined,
    })
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    if (selectedContact && userId) {
      echo?.private(`chat.${selectedContact.id}`).whisper('typing', { user_id: userId })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
  }

  const filteredContacts = contacts.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="p-0 sm:max-w-[400px] flex flex-col h-full">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            {selectedContact && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedContact(null)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <SheetTitle>{selectedContact ? selectedContact.name : "Chat"}</SheetTitle>
          </div>
        </SheetHeader>
        {!selectedContact ? (
          <div className="flex flex-col h-full">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari user..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredContacts.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedContact(user)}
                  className="w-full p-4 text-left hover:bg-muted"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Avatar className="relative">
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        {typingUsers[user.id] && (
                          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
                          </span>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {user.name}
                          {typingUsers[user.id] && (
                            <span className="text-[10px] text-green-500 animate-pulse font-normal">mengetik...</span>
                          )}
                        </p>
                        {user.role && <Badge variant="outline">{user.role}</Badge>}
                      </div>
                    </div>
                    {user.unread_count && user.unread_count > 0 ? (
                      <Badge className="bg-blue-600 hover:bg-blue-700 h-6 min-w-[24px] flex items-center justify-center rounded-full p-0">
                        {user.unread_count}
                      </Badge>
                    ) : null}
                  </div>
                </button>
              ))}
            </ScrollArea>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map(msg => {
                  const isMe = Number(msg.sender_id) === Number(userId)
                  return (
                    <div key={msg.id} className={cn("flex w-full mb-4 group", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("flex items-start max-w-[80%] gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                        <div className="flex flex-col">
                          <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm overflow-hidden",
                            isMe
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-bl-md"
                          )}>
                            {msg.image && (
                              <img
                                src={`${BACKEND_URL}/storage/${msg.image}`}
                                alt="Sent image"
                                className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(`${BACKEND_URL}/storage/${msg.image}`, '_blank')}
                              />
                            )}
                            {msg.message}
                          </div>
                          <span className={cn("text-[10px] text-muted-foreground mt-1", isMe ? "text-right" : "text-left")}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>

                        {isMe && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 self-center"
                            onClick={() => deleteMessageMutation.mutate(msg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
            <div className="p-4 border-t space-y-2">
              {imagePreview && (
                <div className="relative inline-block">
                  <img src={imagePreview} className="h-20 w-20 object-cover rounded-lg border" />
                  <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={() => { setSelectedImage(null); setImagePreview(null); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                      <Smile className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-2" side="top" align="start">
                    <div className="grid grid-cols-5 gap-1">
                      {COMMON_EMOJIS.map(emoji => (
                        <Button key={emoji} variant="ghost" className="h-8 w-8 p-0 text-lg" onClick={() => addEmoji(emoji)}>{emoji}</Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <form className="flex-1 flex gap-2" onSubmit={e => { e.preventDefault(); handleSend(); }}>
                  <Input placeholder="Tulis pesan..." value={newMessage} onChange={handleTyping} />
                  <Button size="icon" disabled={sendMessageMutation.isPending}><Send className="h-4 w-4" /></Button>
                </form>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
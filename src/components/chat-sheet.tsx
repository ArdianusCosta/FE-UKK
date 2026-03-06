"use client"

import * as React from "react"
import { Send, ChevronLeft, Search, Image as ImageIcon, Smile, Trash2, X, Pencil, File as FileIcon, Download, Paperclip } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "../../services/api.service"
import echo from "@/lib/echo"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { User, Message } from "@/types/chat.types"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

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
  const attachmentInputRef = React.useRef<HTMLInputElement>(null)
  const [editingMessage, setEditingMessage] = React.useState<Message | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

  const { theme } = useTheme()

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
    mutationFn: (data: { receiver_id: number; message?: string; image?: File; file?: File }) =>
      apiService.chat.kirimChat(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["messages", selectedContact?.id], (old: Message[] = []) => {
        if (old.some(m => m.id === data.id)) return old
        return [...old, data]
      })
      setNewMessage("")
      setSelectedImage(null)
      setImagePreview(null)
      setSelectedFile(null)
      queryClient.invalidateQueries({ queryKey: ["users-chat"] })
    },
  })
  const updateMessageMutation = useMutation({
    mutationFn: ({ id, message }: { id: number; message: string }) =>
      apiService.chat.updateMessage(id, { message }),
    onSuccess: (data) => {
      queryClient.setQueryData(["messages", selectedContact?.id], (old: Message[] = []) => {
        return old.map(m => m.id === data.id ? data : m)
      })
      setEditingMessage(null)
      setNewMessage("")
    }
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

    channel?.listen("MessageUpdated", (e: any) => {
      const msg = e.message
      if (selectedContact && (msg.sender_id === selectedContact.id || msg.receiver_id === selectedContact.id)) {
        queryClient.setQueryData(["messages", selectedContact.id], (old: Message[] = []) => {
          return old.map(m => m.id === msg.id ? { ...m, ...msg } : m)
        })
      }
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
    if ((!newMessage.trim() && !selectedImage && !selectedFile) || !selectedContact) return

    if (editingMessage) {
      updateMessageMutation.mutate({ id: editingMessage.id, message: newMessage })
    } else {
      sendMessageMutation.mutate({
        receiver_id: selectedContact.id,
        message: newMessage || undefined,
        image: selectedImage || undefined,
        file: selectedFile || undefined,
      })
    }
  }

  const startEditing = (msg: Message) => {
    setEditingMessage(msg)
    setNewMessage(msg.message || "")
  }

  const cancelEditing = () => {
    setEditingMessage(null)
    setNewMessage("")
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
      setSelectedFile(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setSelectedImage(null)
      setImagePreview(null)
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
            {selectedContact?.foto ? (
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={`${BACKEND_URL}/storage/${selectedContact.foto}`}
                  alt={selectedContact.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : selectedContact ? (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{selectedContact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : null}
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
                        {user.foto ? (
                          <img
                            src={`${BACKEND_URL}/storage/${user.foto}`}
                            alt={user.name}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
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
                    <div key={msg.id} className={cn("flex w-full mb-6 group", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "flex items-start max-w-[85%] gap-1",
                        isMe ? "flex-row-reverse" : "flex-row"
                      )}>
                        <div className={cn("flex flex-col group/msg", isMe ? "items-end" : "items-start")}>
                          <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all",
                            isMe
                              ? "bg-blue-600 text-white rounded-br-none hover:bg-blue-700"
                              : "bg-muted dark:bg-zinc-800 text-foreground rounded-bl-none hover:bg-muted/80"
                          )}>
                            {msg.image && (
                              <img
                                src={`${BACKEND_URL}/storage/${msg.image}`}
                                alt="Sent image"
                                className="max-w-full rounded-lg mb-2 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(`${BACKEND_URL}/storage/${msg.image}`, '_blank')}
                              />
                            )}
                            {msg.file && (
                              <div
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer border transition-all",
                                  isMe
                                    ? "bg-white/10 border-white/20 hover:bg-white/20"
                                    : "bg-background/50 border-input hover:bg-background/80"
                                )}
                                onClick={() => window.open(`${BACKEND_URL}/storage/${msg.file}`, '_blank')}
                              >
                                <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                                  <FileIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                  <p className="text-xs font-semibold truncate max-w-[150px]">
                                    {msg.file.split('/').pop()}
                                  </p>
                                  <p className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                                    <Download className="h-3 w-3" /> Unduh file
                                  </p>
                                </div>
                              </div>
                            )}
                            {msg.message && (
                              <div className="relative leading-relaxed break-words">
                                {msg.message}
                                {msg.updated_at !== msg.created_at && (
                                  <span className="text-[9px] italic opacity-60 ml-2 select-none">(diedit)</span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className={cn(
                            "text-[10px] text-muted-foreground mt-1.5 px-1 font-medium",
                            isMe ? "text-right" : "text-left"
                          )}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {isMe && (
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 shrink-0 self-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => startEditing(msg)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => deleteMessageMutation.mutate(msg.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
            <div className="p-4 border-t space-y-2">
              {imagePreview && (
                <div className="relative inline-block animate-in zoom-in-95 duration-200">
                  <img src={imagePreview} className="h-20 w-20 object-cover rounded-lg border shadow-sm" />
                  <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full shadow-lg" onClick={() => { setSelectedImage(null); setImagePreview(null); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {selectedFile && (
                <div className="relative inline-flex items-center gap-3 p-3 bg-muted rounded-xl border animate-in slide-in-from-left duration-200">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col pr-6">
                    <span className="text-xs font-semibold truncate max-w-[150px]">{selectedFile.name}</span>
                    <span className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setSelectedFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {editingMessage && (
                <div className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-center gap-2 text-primary">
                    <Pencil className="h-4 w-4" />
                    <span className="text-xs font-medium">Mengedit pesan...</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={cancelEditing}>Batal</Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                <input type="file" className="hidden" ref={attachmentInputRef} onChange={handleFileChange} />
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("shrink-0 text-muted-foreground", selectedImage && "text-primary bg-primary/10")}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!editingMessage}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("shrink-0 text-muted-foreground", selectedFile && "text-primary bg-primary/10")}
                  onClick={() => attachmentInputRef.current?.click()}
                  disabled={!!editingMessage}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                      <Smile className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] sm:w-[350px] p-0 border-none bg-transparent shadow-none max-w-[calc(100vw-80px)]" side="top" align="start" sideOffset={12}>
                    <EmojiPicker
                      theme={(theme === "dark" ? "dark" : "light") as any}
                      onEmojiClick={(emojiData) => {
                        setNewMessage(prev => prev + emojiData.emoji)
                      }}
                      height={400}
                      width="100%"
                      searchDisabled={false}
                      previewConfig={{ showPreview: false }}
                      skinTonesDisabled
                      lazyLoadEmojis
                    />
                  </PopoverContent>
                </Popover>

                <form className="flex-1 flex gap-2" onSubmit={e => { e.preventDefault(); handleSend(); }}>
                  <Input
                    placeholder={editingMessage ? "Perbarui pesan..." : "Tulis pesan..."}
                    value={newMessage}
                    onChange={handleTyping}
                    className={cn(editingMessage && "border-primary focus-visible:ring-primary")}
                  />
                  <Button
                    size="icon"
                    disabled={sendMessageMutation.isPending || updateMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
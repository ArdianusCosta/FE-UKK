"use client"

import * as React from "react"
import { Bell, Check, CheckCheck, Clock, Package, ArrowLeftRight, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationService, Notification } from "@/services/notification.service"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { useRouter } from "next/navigation"

export function NotificationDropdown() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: notificationsResponse, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getUnreadNotifications(),
    refetchInterval: 30000,
  })

  const { data: allNotificationsResponse } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: () => notificationService.getAllNotifications(),
    enabled: false,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications", "all"] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications", "all"] })
    },
  })

  const getNotificationIcon = (type: string, action: string) => {
    switch (type) {
      case 'peminjaman':
        return <Package className="h-4 w-4 text-blue-500" />
      case 'pengembalian':
        return <ArrowLeftRight className="h-4 w-4 text-green-500" />
      case 'alat':
        if (action === 'low_stock') {
          return <AlertTriangle className="h-4 w-4 text-red-500" />
        }
        return <Package className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationBadge = (action: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      created: { label: "Baru", variant: "default" },
      approved: { label: "Disetujui", variant: "default" },
      rejected: { label: "Ditolak", variant: "destructive" },
      returned: { label: "Dikembalikan", variant: "secondary" },
      updated: { label: "Diperbarui", variant: "secondary" },
      deleted: { label: "Dihapus", variant: "destructive" },
      low_stock: { label: "Stok Menipis", variant: "destructive" },
    }

    const config = variants[action] || { label: action, variant: "outline" as const }
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
  }

  const unreadCount = notificationsResponse?.unread_count || 0
  const notifications = notificationsResponse?.data || []

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    markAsReadMutation.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsReadMutation.mutate(notification.id)

    switch (notification.data.type) {
      case 'peminjaman':
        router.push('/transaksi/peminjaman')
        break
      case 'pengembalian':
        router.push('/transaksi/pengembalian')
        break
      case 'alat':
        router.push('/master-data/alat')
        break
      default:
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="glass h-9 w-9 text-muted-foreground relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 glass" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifikasi</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} belum dibaca
              </Badge>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-6 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Tandai semua
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Tidak ada notifikasi baru</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent/50"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-1">
                    {getNotificationIcon(notification.data.type, notification.data.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getNotificationBadge(notification.data.action)}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: id
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight mb-1">
                      {notification.data.message}
                    </p>
                    {notification.data.user_name && (
                      <p className="text-xs text-muted-foreground">
                        Oleh: {notification.data.user_name}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Button variant="ghost" size="sm" className="w-full">
                Lihat semua notifikasi
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

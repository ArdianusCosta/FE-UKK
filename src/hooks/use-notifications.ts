"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationService } from "@/services/notification.service"

export function useNotifications() {
  const queryClient = useQueryClient()

  const triggerPeminjamanNotification = useMutation({
    mutationFn: ({ peminjamanId, action }: { peminjamanId: number; action: 'created' | 'approved' | 'rejected' | 'returned' }) =>
      notificationService.triggerPeminjamanNotification(peminjamanId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const triggerPengembalianNotification = useMutation({
    mutationFn: ({ pengembalianId, action }: { pengembalianId: number; action: 'created' | 'approved' | 'rejected' }) =>
      notificationService.triggerPengembalianNotification(pengembalianId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const triggerAlatNotification = useMutation({
    mutationFn: ({ alatId, action }: { alatId: number; action: 'created' | 'updated' | 'deleted' | 'low_stock' }) =>
      notificationService.triggerAlatNotification(alatId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  return {
    triggerPeminjamanNotification,
    triggerPengembalianNotification,
    triggerAlatNotification,
  }
}

export function usePeminjamanNotifications() {
  const { triggerPeminjamanNotification } = useNotifications()

  const notifyPeminjamanCreated = async (peminjamanId: number) => {
    return triggerPeminjamanNotification.mutateAsync(
      notificationTriggers.onPeminjamanCreated(peminjamanId)
    )
  }

  const notifyPeminjamanDipinjam = async (peminjamanId: number) => {
    return triggerPeminjamanNotification.mutateAsync(
      notificationTriggers.onPeminjamanDipinjam(peminjamanId)
    )
  }

  const notifyPeminjamanRejected = async (peminjamanId: number) => {
    return triggerPeminjamanNotification.mutateAsync(
      notificationTriggers.onPeminjamanRejected(peminjamanId)
    )
  }

  return {
    notifyPeminjamanCreated,
    notifyPeminjamanDipinjam,
    notifyPeminjamanRejected,
  }
}

export const notificationTriggers = {
  onPeminjamanCreated: (peminjamanId: number) => ({
    peminjamanId,
    action: 'created' as const,
  }),
  
  onPeminjamanDipinjam: (peminjamanId: number) => ({
    peminjamanId,
    action: 'dipinjam' as const,
  }),
  
  onPeminjamanRejected: (peminjamanId: number) => ({
    peminjamanId,
    action: 'rejected' as const,
  }),
  
  onPeminjamanReturned: (peminjamanId: number) => ({
    peminjamanId,
    action: 'returned' as const,
  }),
  
  onPengembalianCreated: (pengembalianId: number) => ({
    pengembalianId,
    action: 'created' as const,
  }),
  
  onPengembalianApproved: (pengembalianId: number) => ({
    pengembalianId,
    action: 'approved' as const,
  }),
  
  onPengembalianRejected: (pengembalianId: number) => ({
    pengembalianId,
    action: 'rejected' as const,
  }),
  
  onAlatCreated: (alatId: number) => ({
    alatId,
    action: 'created' as const,
  }),
  
  onAlatUpdated: (alatId: number) => ({
    alatId,
    action: 'updated' as const,
  }),
  
  onAlatDeleted: (alatId: number) => ({
    alatId,
    action: 'deleted' as const,
  }),
  
  onAlatLowStock: (alatId: number) => ({
    alatId,
    action: 'low_stock' as const,
  }),
}

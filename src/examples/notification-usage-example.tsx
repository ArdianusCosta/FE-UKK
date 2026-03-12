"use client"

import React from 'react'
import { useNotifications, notificationTriggers } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Package, ArrowLeftRight, AlertTriangle } from 'lucide-react'

export function PeminjamanFormExample() {
  const { triggerPeminjamanNotification, triggerPengembalianNotification, triggerAlatNotification } = useNotifications()

  const handleCreatePeminjaman = async () => {
    try {
      const response = await fetch('/api/peminjamans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          alat_id: 1,
          tanggal_pinjam: '2024-03-10',
          tanggal_kembali: '2024-03-15',
          jumlah: 2,
          keperluan: 'Untuk keperluan praktikum'
        })
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        triggerPeminjamanNotification.mutate(
          notificationTriggers.onPeminjamanCreated(result.data.id)
        )
        
        console.log('Peminjaman created and notification sent!')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleApprovePeminjaman = (peminjamanId: number) => {
    triggerPeminjamanNotification.mutate(
      notificationTriggers.onPeminjamanApproved(peminjamanId)
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Contoh Trigger Notifikasi</CardTitle>
        <CardDescription>
          Contoh penggunaan notification hook untuk trigger notifikasi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleCreatePeminjaman} className="w-full">
          <Package className="w-4 h-4 mr-2" />
          Buat Peminjaman Baru
        </Button>
        
        <Button 
          onClick={() => handleApprovePeminjaman(1)} 
          variant="outline"
          className="w-full"
        >
          <Package className="w-4 h-4 mr-2" />
          Setujui Peminjaman #1
        </Button>
      </CardContent>
    </Card>
  )
}

export function NotificationTriggerPanel() {
  const { 
    triggerPeminjamanNotification, 
    triggerPengembalianNotification, 
    triggerAlatNotification 
  } = useNotifications()

  const notificationExamples = [
    {
      title: 'Peminjaman',
      icon: <Package className="w-4 h-4" />,
      actions: [
        { label: 'Created', trigger: () => triggerPeminjamanNotification.mutate(notificationTriggers.onPeminjamanCreated(1)) },
        { label: 'Approved', trigger: () => triggerPeminjamanNotification.mutate(notificationTriggers.onPeminjamanApproved(1)) },
        { label: 'Rejected', trigger: () => triggerPeminjamanNotification.mutate(notificationTriggers.onPeminjamanRejected(1)) },
        { label: 'Returned', trigger: () => triggerPeminjamanNotification.mutate(notificationTriggers.onPeminjamanReturned(1)) },
      ]
    },
    {
      title: 'Pengembalian',
      icon: <ArrowLeftRight className="w-4 h-4" />,
      actions: [
        { label: 'Created', trigger: () => triggerPengembalianNotification.mutate(notificationTriggers.onPengembalianCreated(1)) },
        { label: 'Approved', trigger: () => triggerPengembalianNotification.mutate(notificationTriggers.onPengembalianApproved(1)) },
        { label: 'Rejected', trigger: () => triggerPengembalianNotification.mutate(notificationTriggers.onPengembalianRejected(1)) },
      ]
    },
    {
      title: 'Alat',
      icon: <Package className="w-4 h-4" />,
      actions: [
        { label: 'Created', trigger: () => triggerAlatNotification.mutate(notificationTriggers.onAlatCreated(1)) },
        { label: 'Updated', trigger: () => triggerAlatNotification.mutate(notificationTriggers.onAlatUpdated(1)) },
        { label: 'Deleted', trigger: () => triggerAlatNotification.mutate(notificationTriggers.onAlatDeleted(1)) },
        { label: 'Low Stock', trigger: () => triggerAlatNotification.mutate(notificationTriggers.onAlatLowStock(1)) },
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Bell className="w-6 h-6" />
        Notification Trigger Panel
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notificationExamples.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.actions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={action.trigger}
                  className="w-full justify-start"
                >
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Catatan Penting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• ID yang digunakan di atas adalah contoh (1)</p>
            <p>• Gunakan ID yang sesuai dengan data aktual</p>
            <p>• Notifikasi akan dikirim ke admin, petugas, dan user terkait</p>
            <p>• Email akan dikirim jika konfigurasi sudah benar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function usePeminjamanNotifications() {
  const { triggerPeminjamanNotification } = useNotifications()

  const notifyPeminjamanCreated = async (peminjamanId: number) => {
    return triggerPeminjamanNotification.mutateAsync(
      notificationTriggers.onPeminjamanCreated(peminjamanId)
    )
  }

  const notifyPeminjamanApproved = async (peminjamanId: number) => {
    return triggerPeminjamanNotification.mutateAsync(
      notificationTriggers.onPeminjamanApproved(peminjamanId)
    )
  }

  const notifyPeminjamanRejected = async (peminjamanId: number) => {
    return triggerPeminjamanNotification.mutateAsync(
      notificationTriggers.onPeminjamanRejected(peminjamanId)
    )
  }

  return {
    notifyPeminjamanCreated,
    notifyPeminjamanApproved,
    notifyPeminjamanRejected,
  }
}

export function enhancedApiService() {
  const originalCreatePeminjaman = async (data: any) => {
    const response = await fetch('/api/peminjamans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    
    if (result.status === 'success') {
      await fetch('/api/notifications/peminjaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peminjaman_id: result.data.id,
          action: 'created'
        })
      })
    }
    
    return result
  }
  
  return { originalCreatePeminjaman }
}

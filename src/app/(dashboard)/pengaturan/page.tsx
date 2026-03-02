"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Bell } from "lucide-react"

export default function PengaturanPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 py-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight dark:text-white">Pengaturan Sistem</h1>
                <p className="text-muted-foreground">Konfigurasi preferensi dan identitas sistem AlatKita.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass border-border/50 shadow-xl lg:col-span-1">
                    <CardHeader className="pb-4 flex flex-row items-center gap-4 space-y-0">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-school"><path d="m12 22 10-5V7L12 2 2 7v10Z" /><path d="m2 7 10 5 10-5" /><path d="M12 22V12" /></svg>
                        </div>
                        <div>
                            <CardTitle className="text-xl">Informasi Sekolah</CardTitle>
                            <CardDescription>Detail identitas instansi.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Nama Sekolah</Label>
                            <Input defaultValue="SMK Negeri 1 Alat" className="glass border-border/50 h-11 focus-visible:ring-primary/20" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Alamat Lengkap</Label>
                            <Input defaultValue="Jl. Raya Pendidikan No. 123" className="glass border-border/50 h-11 focus-visible:ring-primary/20" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-border/50 shadow-xl lg:col-span-1">
                    <CardHeader className="pb-4 flex flex-row items-center gap-4 space-y-0">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Notifikasi</CardTitle>
                            <CardDescription>Preferensi pengingat sistem.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-colors">
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold">Email Pengingat</Label>
                                <p className="text-xs text-muted-foreground">Kirim email H-1 batas kembali.</p>
                            </div>
                            <Switch checked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-colors">
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold">Auto-lock Overdue</Label>
                                <p className="text-xs text-muted-foreground">Kunci user telat mengembalikan.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/30">
                    <Button variant="outline" className="glass w-full sm:w-40 h-11 transition-all hover:bg-background/80">
                        Reset Default
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 w-full sm:w-48 h-11 shadow-lg shadow-primary/20 transition-all active:scale-95 text-base font-semibold">
                        Simpan Perubahan
                    </Button>
                </div>
            </div>
        </div>
    )
}

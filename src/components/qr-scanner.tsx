"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw, Loader2, ScanLine, Upload } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"

interface QRScannerProps {
    isOpen: boolean
    onScan: (data: string) => void
    onClose: () => void
}

export function QRScanner({ isOpen, onScan, onClose }: QRScannerProps) {
    const [isInitializing, setIsInitializing] = React.useState(true)
    const [isScanning, setIsScanning] = React.useState(false)
    const scannerRef = React.useRef<Html5Qrcode | null>(null)
    const transitionRef = React.useRef<boolean>(false)
    const scannerId = "qr-reader-container"

    const stopCamera = async () => {
        if (transitionRef.current) return

        if (scannerRef.current && scannerRef.current.isScanning) {
            transitionRef.current = true
            try {
                await scannerRef.current.stop()
                // Clear the container to avoid "already has scanner" errors
                const container = document.getElementById(scannerId)
                if (container) container.innerHTML = ""
            } catch (err) {
                console.warn("Gagal menghentikan kamera (mungkin sudah terhenti):", err)
            } finally {
                transitionRef.current = false
            }
        }
        setIsScanning(false)
        setIsInitializing(false)
    }

    const startCamera = async () => {
        if (transitionRef.current) return

        try {
            setIsInitializing(true)
            transitionRef.current = true

            // Ensure any previous instance is cleaned up
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop()
                }
                const container = document.getElementById(scannerId)
                if (container) container.innerHTML = ""
            }

            const html5QrCode = new Html5Qrcode(scannerId)
            scannerRef.current = html5QrCode

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            }

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    onScan(decodedText)
                    stopCamera()
                },
                (errorMessage) => {
                    // Suppress "not found" noise
                    if (!errorMessage.includes("NotFoundException") &&
                        !errorMessage.includes("No MultiFormat Readers")) {
                        // console.debug("Scanner status:", errorMessage)
                    }
                }
            )

            setIsInitializing(false)
            setIsScanning(true)
        } catch (err) {
            console.error("Scanner Start Error:", err)
            // Only show toast if it's a real failure, not a mounting race condition
            if (isOpen) {
                toast.error("Gagal mengakses kamera. Mohon pastikan izin kamera aktif.")
            }
            setIsInitializing(false)
        } finally {
            transitionRef.current = false
        }
    }

    React.useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                startCamera()
            }, 300)
            return () => {
                clearTimeout(timer)
                stopCamera()
            }
        } else {
            stopCamera()
        }
    }, [isOpen])

    const handleFileScan = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setIsInitializing(true)

            const performFileScan = async () => {
                await stopCamera()

                const html5QrCode = new Html5Qrcode(scannerId)
                html5QrCode.scanFile(file, true)
                    .then(decodedText => {
                        toast.success("QR Code berhasil dibaca!")
                        onScan(decodedText)
                    })
                    .catch(err => {
                        const errorStr = String(err)
                        if (!errorStr.includes("NotFoundException") && !errorStr.includes("No MultiFormat Readers")) {
                            console.error("File Scan Error:", err)
                            toast.error("Gagal membaca QR Code dari gambar.")
                        } else {
                            toast.error("Tidak ditemukan QR Code yang valid di gambar ini.")
                        }
                        // Resume camera after a bit
                        setTimeout(startCamera, 1000)
                    })
                    .finally(() => setIsInitializing(false))
            }
            performFileScan()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-white/10 glass max-h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        <ScanLine className="h-5 w-5 text-primary" />
                        Scan QR Code
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Arahkan kamera ke kode QR peminjaman alat.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-inner group">
                        {/* Loading State Overlay */}
                        {isInitializing && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-900/50 backdrop-blur-sm z-50">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                <span className="text-xs font-medium text-slate-400 animate-pulse tracking-widest uppercase">
                                    Memuat Scanner...
                                </span>
                            </div>
                        )}

                        {/* QR Code Reader Target */}
                        <div
                            id={scannerId}
                            className="absolute inset-0 z-0 [&>video]:object-cover [&>video]:w-full [&>video]:h-full"
                        ></div>

                        {/* Fallback View */}
                        {!isScanning && !isInitializing && (
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center -z-10">
                                <Camera className="w-16 h-16 text-white/5" />
                            </div>
                        )}

                        {/* Scanner Decoration Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-white/5 rounded-3xl backdrop-blur-[0.5px]">
                                {/* Corners */}
                                <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                                <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl shadow-[0_0_15px_rgba(59,130,246,0.3)]" />

                                {/* Scan Line */}
                                {isScanning && (
                                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scan" />
                                )}
                            </div>
                        </div>

                        {/* Active Badge */}
                        {isScanning && (
                            <div className="absolute top-4 left-4 z-20">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                                        LIVE
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                disabled={isInitializing}
                                onClick={() => {
                                    stopCamera().then(() => startCamera())
                                }}
                                className="h-16 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl flex flex-col gap-1 active:scale-95 transition-all group"
                            >
                                <RefreshCw className={`h-5 w-5 text-primary group-hover:rotate-180 transition-transform ${isInitializing ? 'animate-spin' : ''}`} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Ulangi Kamera</span>
                            </Button>

                            <Button
                                variant="outline"
                                disabled={isInitializing}
                                onClick={() => document.getElementById('qr-file-upload')?.click()}
                                className="h-16 glass border-white/10 hover:bg-white/5 text-white rounded-2xl flex flex-col gap-1 active:scale-95 transition-all group"
                            >
                                <Upload className="h-5 w-5 text-primary group-hover:-translate-y-1 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Upload Gambar</span>
                            </Button>
                            <input
                                id="qr-file-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileScan}
                            />
                        </div>

                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="w-full h-12 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                        >
                            Batalkan
                        </Button>
                    </div>
                </div>

                <style jsx global>{`
                    @keyframes scan {
                        0% { top: 0%; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                    .animate-scan {
                        position: absolute;
                        width: 100%;
                        animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    )
}

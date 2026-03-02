"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description?: string
    confirmLabel?: string
    variant?: "destructive" | "default"
    loading?: boolean
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Hapus",
    variant = "destructive",
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] glass border-border/50">
                <DialogHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                    </div>
                    <DialogTitle className="text-xl font-bold dark:text-white text-center">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-center text-muted-foreground">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-between w-full mt-4">
                    <Button variant="outline" onClick={onClose} className="glass">
                        Batal
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        onClick={onConfirm}
                        disabled={loading}
                        className="shadow-lg"
                    >
                        {loading ? "Menghapus..." : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

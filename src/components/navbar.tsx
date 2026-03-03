"use client"

import * as React from "react"
import { Bell, Search, User, Menu, MessageSquare } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileSidebar } from "@/components/sidebar"
import { ChatSheet } from "@/components/chat-sheet"
import { useAuth } from "@/contexts/auth-context"


export function Navbar() {
    const { user } = useAuth()
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
    const initials = user?.name
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : "U"

    return (
        <header className="h-16 sticky top-0 z-40 glass border-b transition-all duration-300">
            <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="lg:hidden">
                        <MobileSidebar>
                            <Button variant="ghost" size="icon" className="glass h-9 w-9">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </MobileSidebar>
                    </div>
                    <div className="relative w-full max-w-md hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari sesuatu..."
                            className="pl-10 glass border-sidebar-border focus-visible:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-4">
                    <ChatSheet>
                        <Button variant="ghost" size="icon" className="glass h-9 w-9 text-muted-foreground relative group">
                            <MessageSquare className="h-5 w-5 group-hover:text-primary transition-colors" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse"></span>
                        </Button>
                    </ChatSheet>

                    <Button variant="ghost" size="icon" className="glass h-9 w-9 text-muted-foreground relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
                    </Button>

                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full glass border border-sidebar-border">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.foto ? `${BACKEND_URL}/storage/${user.foto}` : ""} alt={`@${user?.name}`} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">

                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 glass" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email || "user@example.com"}
                                    </p>
                                </div>

                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-sidebar-border" />
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profil</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}

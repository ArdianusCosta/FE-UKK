import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { AuthProvider } from "@/contexts/auth-context"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-background">
                <Sidebar />
                <div className="lg:pl-64 transition-all duration-300">
                    <Navbar />
                    <main className="p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    )
}

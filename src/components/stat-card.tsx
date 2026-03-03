import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
    title: string
    value: string | React.ReactNode
    icon: LucideIcon
    description?: string
    isLoading?: boolean
    trend?: {
        value: string | React.ReactNode
        icon?: LucideIcon
        positive?: boolean
    }
}

export function StatCard({ title, value, icon: Icon, description, trend, isLoading }: StatCardProps) {
    if (isLoading) {
        return (
            <Card className="glass overflow-hidden border-border/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-9 w-16" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-xl" />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Skeleton className="h-4 w-12 rounded-md" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="glass overflow-hidden border-border/50 group hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                            {title}
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight dark:text-white group-hover:text-glow">
                            {value}
                        </h2>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
                {(description || trend) && (
                    <div className="mt-4 flex items-center gap-2">
                        {trend && (
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1",
                                trend.positive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            )}>
                                {trend.icon && <trend.icon className="h-3 w-3" />}
                                {trend.value}
                            </span>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground italic">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

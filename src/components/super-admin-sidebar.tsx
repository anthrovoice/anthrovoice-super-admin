"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
    Sidebar, SidebarContent, SidebarFooter,
    SidebarGroup, SidebarGroupContent, SidebarHeader,
    SidebarMenu, SidebarMenuItem, SidebarMenuButton,
    SidebarRail, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard, Users, Bot, Phone,
    LogOut, User2, Settings,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const navItems = [
    { label: "Platform Overview", href: "/super-admin", icon: LayoutDashboard },
    { label: "Clients", href: "/super-admin/clients", icon: Users },
    { label: "Agents", href: "/super-admin/agents", icon: Bot },
    { label: "Phone Numbers", href: "/super-admin/phones", icon: Phone },
]

interface SuperAdminSidebarProps {
    user?: {
        name: string
        email: string
        role: string
    }
}

export function SuperAdminSidebar({ user }: SuperAdminSidebarProps) {
    const pathname = usePathname()
    const { open } = useSidebar()

    const displayName = user?.name ?? user?.email ?? "Super Admin"
    const displayEmail = user?.email ?? ""
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <Sidebar collapsible="icon" className="border-r border-border/60 bg-slate-950 text-slate-50 dark:bg-slate-950">
            {/* Header */}
            <SidebarHeader className="px-3 py-4">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center overflow-hidden">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        {open && (
                            <span className="font-semibold text-sm truncate tracking-tight">Super Admin</span>
                        )}
                    </div>
                    {open && (
                        <SidebarTrigger className="text-slate-400 hover:text-white shrink-0" />
                    )}
                </div>
                {!open && (
                    <div className="flex justify-center mt-2">
                        <SidebarTrigger className="text-slate-400 hover:text-white" />
                    </div>
                )}
            </SidebarHeader>

            <Separator className="opacity-20 bg-slate-700" />

            {/* Nav */}
            <SidebarContent className="px-2 py-3">
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                // Special check for root path to avoid matching all
                                const isStrictActive = item.href === '/super-admin' ? pathname === '/super-admin' : isActive

                                return (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isStrictActive}
                                            tooltip={item.label}
                                            className={cn(
                                                "h-9 rounded-md text-sm font-medium transition-colors",
                                                "text-slate-400 hover:text-white hover:bg-slate-800",
                                                isStrictActive && "bg-indigo-600/10 text-indigo-400 font-semibold"
                                            )}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="w-4 h-4 shrink-0" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="px-2 py-3">
                <Separator className="opacity-20 bg-slate-700 mb-3" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    className="h-10 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white data-[state=open]:bg-slate-800"
                                    tooltip="Account"
                                >
                                    <Avatar className="w-5 h-5 shrink-0 border border-slate-700">
                                        <AvatarFallback className="text-[10px] bg-slate-800 text-slate-300 font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start min-w-0 leading-tight">
                                        <span className="text-sm font-medium truncate">{displayName}</span>
                                        <span className="text-xs text-slate-500 truncate">{displayEmail}</span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-52 mb-1 border-slate-800 bg-slate-900 text-slate-300">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium text-sm text-white">{displayName}</span>
                                        <span className="text-xs text-slate-400">{displayEmail}</span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                    <User2 className="w-4 h-4 mr-2" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-800" />
                                <DropdownMenuItem
                                    className="text-red-400 focus:text-red-300 focus:bg-red-400/10 cursor-pointer"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}

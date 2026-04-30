"use client"

import { useState, useEffect } from "react"
import { Users, Bot, Phone, PhoneCall, TrendingUp } from "lucide-react"
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardClient() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    async function fetchStats() {
        try {
            const res = await fetch("/api/super-admin/stats")
            const data = await res.json()
            if (data.platform) setStats(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-12 text-center text-slate-500">Loading platform metrics...</div>
    }

    if (!stats) return null

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm shadow-indigo-100/50 dark:shadow-none bg-white dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Clients</CardTitle>
                        <Users className="w-4 h-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.platform.clients}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm shadow-emerald-100/50 dark:shadow-none bg-white dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Agents</CardTitle>
                        <Bot className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.platform.agents}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm shadow-blue-100/50 dark:shadow-none bg-white dark:bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Phone Numbers</CardTitle>
                        <Phone className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.platform.phones}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm shadow-violet-100/50 dark:shadow-none bg-white dark:bg-slate-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-16 h-16 text-violet-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Calls</CardTitle>
                        <PhoneCall className="w-4 h-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.platform.calls.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Client Breakdown Table */}
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Client Breakdown</h3>
                <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider py-4">Client</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider text-right py-4">Agents</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider text-right py-4">Phones</TableHead>
                                <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider text-right py-4">Total Calls</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-slate-500">No clients found</TableCell>
                                </TableRow>
                            ) : (
                                stats.clients.map((client: any) => (
                                    <TableRow key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <TableCell>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{client.name}</div>
                                            <div className="text-xs text-slate-500">{client.email}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{client.agents}</TableCell>
                                        <TableCell className="text-right font-medium">{client.phones}</TableCell>
                                        <TableCell className="text-right font-semibold text-violet-600 dark:text-violet-400">
                                            {client.calls.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

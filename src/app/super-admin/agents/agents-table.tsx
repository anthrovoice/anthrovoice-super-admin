"use client"

import { useState, useEffect } from "react"
import { Plus, Bot, MoreHorizontal, Trash2 } from "lucide-react"
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function AgentsTable({ clients }: { clients: any[] }) {
    const [agents, setAgents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [addOpen, setAddOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<any>(null)
    
    const [form, setForm] = useState({ agentId: "", userId: "" })
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchAgents()
    }, [])

    async function fetchAgents() {
        setLoading(true)
        try {
            const res = await fetch("/api/super-admin/agents")
            const data = await res.json()
            if (data.data) setAgents(data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleImport() {
        setError("")
        if (!form.agentId || !form.userId) { setError("Agent ID and client are required"); return }
        
        setActionLoading(true)
        try {
            const res = await fetch("/api/super-admin/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agentId: form.agentId.trim(), userId: form.userId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            
            setAgents([data, ...agents])
            setAddOpen(false)
            setForm({ agentId: "", userId: "" })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    async function handleDelete() {
        setActionLoading(true)
        try {
            await fetch(`/api/super-admin/agents/${deleteTarget._id}`, { method: "DELETE" })
            setAgents(agents.filter(a => a._id !== deleteTarget._id))
            setDeleteTarget(null)
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading imported agents...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Imported Agents</h2>
                        <p className="text-xs text-slate-500">Total: {agents.length}</p>
                    </div>
                </div>
                <Button onClick={() => { setError(""); setAddOpen(true) }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4" /> Import Agent
                </Button>
            </div>

            <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Agent</TableHead>
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Language</TableHead>
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Status</TableHead>
                            <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-slate-500">No agents imported yet</TableCell>
                            </TableRow>
                        ) : (
                            agents.map(agent => (
                                <TableRow key={agent._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{agent.name || "Unnamed Agent"}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{agent.externalAgentId}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-slate-50">
                                            {agent.language}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={agent.status ? "secondary" : "destructive"} className={agent.status ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}>
                                            {agent.status ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(agent)}>
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Agent
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Import Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Import Retell Agent</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
                        <div className="space-y-2">
                            <Label>Agent ID</Label>
                            <Input value={form.agentId} onChange={e => setForm({...form, agentId: e.target.value})} placeholder="agent_xyz123" />
                            <p className="text-xs text-slate-500">The exact agent_id from the Retell dashboard.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Assign to Client</Label>
                            <Select value={form.userId} onValueChange={v => setForm({...form, userId: v})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a client..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.displayName || c.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddOpen(false)} disabled={actionLoading}>Cancel</Button>
                        <Button onClick={handleImport} disabled={actionLoading} className="bg-indigo-600 hover:bg-indigo-700">Import Agent</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the agent <b>{deleteTarget?.name}</b> from BOTH the local database and Retell AI. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

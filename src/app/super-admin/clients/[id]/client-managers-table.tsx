"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, UserCheck, UserX, Trash2, Mail, User } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function ClientManagersTable({ clientId, initialManagers }: { clientId: string, initialManagers: any[] }) {
    const [managers, setManagers] = useState(initialManagers)
    const [addOpen, setAddOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<any>(null)
    
    const [form, setForm] = useState({ email: "", password: "", displayName: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    function getInitials(name: string, email: string) {
        const str = name || email
        return str.split(/[\s@]/).map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    }

    async function handleAdd() {
        setError("")
        if (!form.email || !form.password) { setError("Email and password required"); return }
        if (form.password.length < 8) { setError("Password must be at least 8 characters"); return }
        
        setLoading(true)
        try {
            const res = await fetch(`/api/super-admin/clients/${clientId}/managers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            
            setManagers([...managers, data])
            setAddOpen(false)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        setLoading(true)
        try {
            await fetch(`/api/super-admin/clients/${clientId}/managers/${deleteTarget.id}`, { method: "DELETE" })
            setManagers(managers.filter(m => m.id !== deleteTarget.id))
            setDeleteTarget(null)
        } finally {
            setLoading(false)
        }
    }

    async function toggleLock(manager: any) {
        const next = !manager.isAccountLocked
        const res = await fetch(`/api/super-admin/clients/${clientId}/managers/${manager.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAccountLocked: next })
        })
        if (res.ok) {
            setManagers(managers.map(m => m.id === manager.id ? { ...m, isAccountLocked: next } : m))
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Managers</h2>
                        <p className="text-xs text-slate-500">Total: {managers.length}</p>
                    </div>
                </div>
                <Button onClick={() => { setForm({ email: "", password: "", displayName: "" }); setError(""); setAddOpen(true) }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4" /> Add Manager
                </Button>
            </div>

            <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Manager Info</TableHead>
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Status</TableHead>
                            <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {managers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-32 text-center text-slate-500">No managers found for this client</TableCell>
                            </TableRow>
                        ) : (
                            managers.map(manager => (
                                <TableRow key={manager.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 border shadow-sm">
                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold dark:bg-slate-800 dark:text-slate-300">
                                                    {getInitials(manager.displayName, manager.email)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{manager.displayName || "No Name"}</div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {manager.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={manager.isAccountLocked ? "destructive" : "default"} className={!manager.isAccountLocked ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}>
                                            {manager.isAccountLocked ? "Locked" : "Active"}
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
                                                <DropdownMenuItem onClick={() => toggleLock(manager)}>
                                                    {manager.isAccountLocked ? "Unlock Access" : "Lock Access"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(manager)}>Remove Manager</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Manager for Client</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="manager@company.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 8 chars" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddOpen(false)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">Add Manager</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Manager?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove <b>{deleteTarget?.displayName || deleteTarget?.email}</b> and their access.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

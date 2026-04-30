"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, MoreHorizontal, ShieldCheck, Mail, Building, Users } from "lucide-react"
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

export function ClientsTable({ initialAdmins }: { initialAdmins: any[] }) {
    const router = useRouter()
    const [admins, setAdmins] = useState(initialAdmins)
    const [addOpen, setAddOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<any>(null)
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
            const res = await fetch("/api/super-admin/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            
            setAdmins([data, ...admins])
            setAddOpen(false)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleEdit() {
        setError("")
        setLoading(true)
        try {
            const res = await fetch(`/api/super-admin/clients/${editTarget.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayName: form.displayName })
            })
            if (!res.ok) throw new Error((await res.json()).error)
            
            setAdmins(admins.map(a => a.id === editTarget.id ? { ...a, displayName: form.displayName } : a))
            setEditTarget(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        setLoading(true)
        try {
            await fetch(`/api/super-admin/clients/${deleteTarget.id}`, { method: "DELETE" })
            setAdmins(admins.filter(a => a.id !== deleteTarget.id))
            setDeleteTarget(null)
        } finally {
            setLoading(false)
        }
    }

    async function toggleLock(admin: any) {
        const next = !admin.isAccountLocked
        const res = await fetch(`/api/super-admin/clients/${admin.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAccountLocked: next })
        })
        if (res.ok) {
            setAdmins(admins.map(a => a.id === admin.id ? { ...a, isAccountLocked: next } : a))
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                        <Building className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Client Accounts</h2>
                        <p className="text-xs text-slate-500">Total: {admins.length}</p>
                    </div>
                </div>
                <Button onClick={() => { setForm({ email: "", password: "", displayName: "" }); setError(""); setAddOpen(true) }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4" /> New Client
                </Button>
            </div>

            <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Client Info</TableHead>
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Status</TableHead>
                            <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-32 text-center text-slate-500">No clients found</TableCell>
                            </TableRow>
                        ) : (
                            admins.map(admin => (
                                <TableRow key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 border shadow-sm">
                                                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-semibold dark:bg-indigo-900/40 dark:text-indigo-400">
                                                    {getInitials(admin.displayName, admin.email)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-slate-100">{admin.displayName || "No Name"}</div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {admin.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Badge variant={admin.isAccountLocked ? "destructive" : "default"} className={!admin.isAccountLocked ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}>
                                                {admin.isAccountLocked ? "Locked" : "Active"}
                                            </Badge>
                                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">
                                                <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" className="h-8" onClick={() => router.push(`/super-admin/clients/${admin.id}`)}>
                                                <Users className="w-3.5 h-3.5 mr-1.5" /> Managers
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => { setForm({ ...form, displayName: admin.displayName || "" }); setEditTarget(admin); setError("") }}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleLock(admin)}>
                                                        {admin.isAccountLocked ? "Unlock Access" : "Lock Access"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(admin)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
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
                    <DialogHeader><DialogTitle>Create Client Admin</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
                        <div className="space-y-2">
                            <Label>Company / Name</Label>
                            <Input value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} placeholder="Acme Corp" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@acme.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 8 chars" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddOpen(false)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleAdd} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">Create Client</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
                        <div className="space-y-2">
                            <Label>Company / Name</Label>
                            <Input value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTarget(null)} disabled={loading}>Cancel</Button>
                        <Button onClick={handleEdit} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove <b>{deleteTarget?.displayName || deleteTarget?.email}</b> and their access.
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

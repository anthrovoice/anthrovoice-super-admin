"use client"

import { useState, useEffect } from "react"
import { Plus, Phone, Building } from "lucide-react"
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function PhonesTable({ clients }: { clients: any[] }) {
    const [phones, setPhones] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [addOpen, setAddOpen] = useState(false)
    
    const [form, setForm] = useState({ phoneNumber: "", userId: "" })
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchPhones()
    }, [])

    async function fetchPhones() {
        setLoading(true)
        try {
            const res = await fetch("/api/super-admin/phones")
            const data = await res.json()
            if (data.data) setPhones(data.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleImport() {
        setError("")
        if (!form.phoneNumber || !form.userId) { setError("Phone number and client are required"); return }
        
        setActionLoading(true)
        try {
            // Format phone number to ensure it has + if missing
            let num = form.phoneNumber.trim()
            if (!num.startsWith("+")) num = "+" + num

            const res = await fetch("/api/super-admin/phones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: num, userId: form.userId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            
            setPhones([data, ...phones])
            setAddOpen(false)
            setForm({ phoneNumber: "", userId: "" })
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading phone numbers...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Imported Numbers</h2>
                        <p className="text-xs text-slate-500">Total: {phones.length}</p>
                    </div>
                </div>
                <Button onClick={() => { setError(""); setAddOpen(true) }} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4" /> Import Number
                </Button>
            </div>

            <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Phone Number</TableHead>
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Provider</TableHead>
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Inbound Agent</TableHead>
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-300 uppercase text-xs tracking-wider">Outbound Agent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {phones.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-slate-500">No phone numbers imported yet</TableCell>
                            </TableRow>
                        ) : (
                            phones.map(phone => (
                                <TableRow key={phone._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{phone.phone_number_pretty || phone.phone}</div>
                                        {phone.nickname && <div className="text-xs text-slate-500">{phone.nickname}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-slate-600 bg-slate-50">
                                            {phone.provider || "Unknown"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {phone.inbound_agent_id ? (
                                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                {phone.inbound_agent_id.slice(0,8)}...
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {phone.outbound_agent_id ? (
                                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                {phone.outbound_agent_id.slice(0,8)}...
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">None</span>
                                        )}
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
                    <DialogHeader><DialogTitle>Import Retell Phone Number</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="+1234567890" />
                            <p className="text-xs text-slate-500">Must exactly match the number in Retell, including country code.</p>
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
                        <Button onClick={handleImport} disabled={actionLoading} className="bg-indigo-600 hover:bg-indigo-700">Import Number</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAdminStore } from "@/hooks/adminStore";
import { motion, AnimatePresence } from "motion/react";
import { FiClock, FiFilter, FiUser, FiActivity } from "react-icons/fi";

interface WorkerDetailsProps {
    workers: any[];
}

export const WorkerDetails = ({ workers }: WorkerDetailsProps) => {
    const [selectedId, setSelectedId] = useState(workers[0]?.id);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const token = useAdminStore.getState().token;

    useEffect(() => {
        if (selectedId) fetchHistory();
    }, [selectedId]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/workers/${selectedId}/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setHistory(response.data.history);
            }
        } catch (error) {
            console.error("History fetch failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedWorker = workers.find(w => w.id === selectedId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Worker Selector Card */}
                <div className="w-full lg:w-72 glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FiFilter className="text-primary w-4 h-4" />
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Focus Node</h3>
                    </div>
                    <div className="space-y-4">
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        >
                            {workers.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>

                        {selectedWorker && (
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FiUser className="text-primary w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">{selectedWorker.name}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                                    Monitoring logs for workstation: <span className="text-primary">{selectedWorker.workstation?.name}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Log Table Card */}
                <div className="flex-1 glass-card overflow-hidden">
                    <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-tight flex items-center gap-2">
                            <FiActivity className="text-primary" /> Temporal Event Log
                        </h3>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase bg-card px-2 py-1 rounded-lg border border-border">
                            Last {history.length} operations
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-secondary/10 text-muted-foreground border-b border-border">
                                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Time Index</th>
                                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Operation Type</th>
                                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">AI Confidence</th>
                                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                <AnimatePresence mode="popLayout">
                                    {history.map((event: any, i) => (
                                        <motion.tr
                                            key={event.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-secondary/20 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-foreground font-semibold text-xs">
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${event.eventType === 'working' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' :
                                                        event.eventType === 'product_count' ? 'bg-blue-500/5 border-blue-500/20 text-blue-600' :
                                                            'bg-secondary border-border text-muted-foreground'
                                                    }`}>
                                                    {event.eventType.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{ width: `${(event.confidence || 1) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-muted-foreground">{Math.round((event.confidence || 1) * 100)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium text-xs">
                                                {event.eventType === 'product_count' ? `Yield: +${event.count} Unit` : 'State transition detected'}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {history.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                                            No logs found for selected period
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

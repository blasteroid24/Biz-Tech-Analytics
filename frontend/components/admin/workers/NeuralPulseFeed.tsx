"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { FiActivity, FiClock, FiCheckCircle, FiInfo } from "react-icons/fi";

const MOCK_EVENTS = [
    "Production cycle completed at Station A-102",
    "Pressure sensors calibrated in Paint Shop",
    "Efficiency increase in Engine Assembly (+4.2%)",
    "New worker logged into Assembly Line B",
    "Scheduled maintenance check for Robotic Arm v3",
    "Environmental controls optimized for Floor 2",
];

export const NeuralPulseFeed = () => {
    const [pulses, setPulses] = useState<{ id: number, text: string, type: 'info' | 'success' }[]>([]);

    useEffect(() => {
        // Initial events
        setPulses([
            { id: 1, text: "System monitoring active", type: 'info' },
            { id: 2, text: "Connectivity established", type: 'success' }
        ]);

        const interval = setInterval(() => {
            const text = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
            const type = text.includes('+') || text.includes('completed') ? 'success' : 'info';
            setPulses(prev => [{ id: Date.now(), text, type }, ...prev.slice(0, 5)]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FiActivity className="text-primary w-4 h-4" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">System Events</h3>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    <FiClock className="w-3 h-3" /> LIVE
                </div>
            </div>

            <div className="space-y-4 flex-1">
                <AnimatePresence mode="popLayout">
                    {pulses.map((pulse) => (
                        <motion.div
                            key={pulse.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50 group"
                        >
                            <div className={`mt-0.5 p-1 rounded-md ${pulse.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                {pulse.type === 'success' ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiInfo className="w-3.5 h-3.5" />}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-foreground leading-tight tracking-tight">{pulse.text}</p>
                                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                                    {new Date(pulse.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {pulses.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <FiActivity className="w-8 h-8 text-muted-foreground/20 mb-2" />
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Awaiting Events...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

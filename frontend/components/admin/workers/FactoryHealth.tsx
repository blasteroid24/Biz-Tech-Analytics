"use client";
import { motion } from "motion/react";
import { FiActivity, FiTrendingUp } from "react-icons/fi";

interface FactoryHealthProps {
    utilization: number;
}

export const FactoryHealth = ({ utilization }: FactoryHealthProps) => {
    return (
        <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <FiActivity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground tracking-tight">Factory Utilization</h3>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aggregate Real-time Performance</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-black text-primary tracking-tighter">{utilization}%</span>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center justify-end gap-1">
                        <FiTrendingUp className="w-3 h-3" /> Nominal
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="h-4 w-full bg-secondary rounded-full overflow-hidden relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${utilization}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: "Optimal Range", val: "75-90%", status: "success" },
                        { label: "Current State", val: utilization > 80 ? "Peak" : "Steady", status: "success" },
                        { label: "Active Nodes", val: "12/12", status: "success" },
                        { label: "Efficiency", val: "+4.2%", status: "success" }
                    ].map((item, i) => (
                        <div key={i} className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-sm font-bold text-foreground">{item.val}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

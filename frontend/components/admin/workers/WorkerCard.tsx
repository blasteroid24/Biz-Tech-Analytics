"use client";
import { motion } from "motion/react";
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from "recharts";
import { FiPackage, FiMapPin, FiUser } from "react-icons/fi";

interface WorkerCardProps {
    worker: any;
}

// Chart colors inspired by the image
const COLORS = ['#22C55E', '#3B82F6', '#E5E7EB'];

export const WorkerCard = ({ worker }: WorkerCardProps) => {
    const pieData = [
        { name: 'Working', value: worker.metrics.totalActiveTimeMins },
        { name: 'Idle', value: (12 * 60) - worker.metrics.totalActiveTimeMins } // Assuming 12h shift for visual clarity
    ];

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className="glass-card p-6 group relative overflow-hidden"
        >
            {/* Top Bar: Name & Status */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-sm">
                        {worker.imageUrl ? (
                            <img src={worker.imageUrl} alt={worker.name} className="w-full h-full object-cover" />
                        ) : (
                            <FiUser className="w-6 h-6 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground tracking-tight">{worker.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
                            <FiMapPin className="w-3 h-3 text-primary" /> {worker.workstation?.name || "Unassigned"}
                        </p>
                    </div>
                </div>
                
                <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 ${
                    worker.currentStatus === 'working' 
                        ? 'bg-primary/5 border-primary/20 text-primary' 
                        : 'bg-secondary border-border text-muted-foreground'
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${worker.currentStatus === 'working' ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{worker.currentStatus}</span>
                </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-secondary/30 p-3 rounded-2xl border border-border/40">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Throughput</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground">{worker.metrics.throughput}</span>
                        <span className="text-[9px] text-muted-foreground font-bold">U/HR</span>
                    </div>
                </div>
                <div className="bg-secondary/30 p-3 rounded-2xl border border-border/40">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Yield</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground">{worker.metrics.totalProducts}</span>
                        <FiPackage className="w-3 h-3 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative pt-4 border-t border-border/50">
                <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={28}
                                outerRadius={38}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill={COLORS[0]} />
                                <Cell fill={COLORS[2]} />
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #e5e7eb', 
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                    <span className="text-[10px] font-bold text-foreground">{Math.round((worker.metrics.totalActiveTimeMins / (12*60)) * 100)}%</span>
                    <span className="text-[8px] text-muted-foreground font-bold uppercase">Active</span>
                </div>
            </div>
        </motion.div>
    );
};

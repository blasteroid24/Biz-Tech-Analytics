"use client";

import { useAdminStore } from "@/hooks/adminStore";
import { useWorkerStore } from "@/hooks/workerStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FiGrid, FiUsers, FiSettings, FiLogOut, FiBell, FiSearch,
    FiTrendingUp, FiActivity, FiShield, FiMenu, FiX, FiCheckCircle
} from "react-icons/fi";
import { motion, AnimatePresence } from "motion/react";
import { FactoryHealth } from "./workers/FactoryHealth";
import { WorkerCard } from "./workers/WorkerCard";
import { WorkerDetails } from "./workers/WorkerDetails";

const Dashboard = () => {
    const { isVerified, admin, logout } = useAdminStore();
    const { workers, fetchWorkers, isLoading } = useWorkerStore();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        if (!isVerified) {
            router.push("/admin");
        } else {
            fetchWorkers();
            const interval = setInterval(fetchWorkers, 30000);
            return () => clearInterval(interval);
        }
    }, [isVerified, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/admin");
    };

    if (!isVerified) return null;

    const avgUtilization = Math.round(
        workers.reduce((acc, w) => acc + w.metrics.utilizationPercent, 0) / (workers.length || 1)
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans w-full relative">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? "w-72" : "w-20"} transition-all duration-300 ease-in-out border-r border-border bg-white flex flex-col hidden md:flex sticky top-0 h-screen z-50`}>
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <FiShield className="w-6 h-6 text-primary-foreground" />
                    </div>
                    {isSidebarOpen && (
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-tight text-foreground tracking-tight">BizTech</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enterprise</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
                    {/* Main Section */}
                    <div>
                        {isSidebarOpen && <p className="px-4 mb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Operations</p>}
                        <nav className="space-y-1.5">
                            {[
                                { icon: FiGrid, label: "Dashboard", id: "overview" },
                                { icon: FiUsers, label: "Workforce", id: "workers" },
                                { icon: FiActivity, label: "Production", id: "stations" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${activeTab === item.id
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-primary" : ""}`} />
                                    {isSidebarOpen && <span>{item.label}</span>}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* System Section */}
                    <div>
                        {isSidebarOpen && <p className="px-4 mb-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Management</p>}
                        <nav className="space-y-1.5">
                            {[
                                { icon: FiSettings, label: "Settings", id: "settings" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${activeTab === item.id
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-primary" : ""}`} />
                                    {isSidebarOpen && <span>{item.label}</span>}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="p-4 border-t border-border bg-secondary/20">
                    <div className="bg-white border border-border p-3 rounded-2xl shadow-sm flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border border-border shrink-0">
                            {admin?.username?.[0]?.toUpperCase() || "A"}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{admin?.username || "Admin"}</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Supervisor</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button onClick={handleLogout} className="p-2 hover:bg-destructive/5 hover:text-destructive text-muted-foreground rounded-lg transition-colors">
                                <FiLogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 relative min-h-screen flex flex-col bg-background/50">
                <header className="h-20 border-b border-border flex items-center justify-between px-8 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors hidden md:block">
                            {isSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                        </button>
                        <h2 className="text-xl font-bold text-foreground">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">System Live</span>
                        </div>
                        <button className="p-2.5 bg-card border border-border rounded-xl text-muted-foreground hover:text-primary transition-colors">
                            <FiBell className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <main className="p-8 space-y-8 max-w-7xl mx-auto w-full flex-1">
                    <AnimatePresence mode="wait">
                        {isLoading && workers.length === 0 ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-[60vh] flex flex-col items-center justify-center gap-4"
                            >
                                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                <div className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Synchronizing Data...</div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {activeTab === "overview" && (
                                    <>
                                        <div className="w-full">
                                            <FactoryHealth utilization={avgUtilization} />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FiUsers className="text-primary w-5 h-5" />
                                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Active Workstations</h3>
                                                </div>
                                                <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">{workers.length} Units Online</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {workers.map((worker, i) => (
                                                    <motion.div
                                                        key={worker.id}
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                    >
                                                        <WorkerCard worker={worker} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === "workers" && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {workers.map((worker) => (
                                                <WorkerCard key={worker.id} worker={worker} />
                                            ))}
                                        </div>
                                        <WorkerDetails workers={workers} />
                                    </div>
                                )}

                                {activeTab === "stations" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {workers.map((worker) => (
                                            <div key={worker.id} className="glass-card p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-foreground font-bold text-sm tracking-tight">{worker.workstation?.name}</h4>
                                                    <FiCheckCircle className="text-primary w-4 h-4" />
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[11px] font-bold uppercase text-muted-foreground">
                                                        <span>Utilization</span>
                                                        <span className="text-primary">{worker.metrics.utilizationPercent}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${worker.metrics.utilizationPercent}%` }}
                                                            className="h-full bg-primary"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mt-6">
                                                        <div className="bg-secondary/50 p-3 rounded-xl border border-border/50">
                                                            <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Throughput</p>
                                                            <p className="text-sm font-bold text-foreground">{worker.metrics.throughput} <span className="text-[10px] text-muted-foreground">u/h</span></p>
                                                        </div>
                                                        <div className="bg-secondary/50 p-3 rounded-xl border border-border/50">
                                                            <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Produced</p>
                                                            <p className="text-sm font-bold text-foreground">{worker.metrics.totalProducts}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === "live" && (
                                    <div className="h-96 flex flex-col items-center justify-center border-2 border-border border-dashed rounded-[2rem] bg-secondary/10">
                                        <FiTrendingUp className="w-10 h-10 text-muted-foreground/30 mb-4" />
                                        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Advanced Analytics Feed Offline</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <footer className="px-8 py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>&copy; 2026 BizTech Analytics</span>
                    </div>
                    <div className="flex gap-6">
                        <span>Privacy Policy</span>
                        <span>Terminal v2.0.1</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;
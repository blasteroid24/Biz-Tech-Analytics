import { create } from 'zustand';
import axios from 'axios';
import { useAdminStore } from './adminStore';

interface Worker {
    id: string;
    name: string;
    imageUrl: string;
    workstation: {
        name: string;
    };
    metrics: {
        totalActiveTimeMins: number;
        utilizationPercent: number;
        throughput: number;
        totalProducts: number;
    };
    currentStatus: 'working' | 'idle' | 'absent';
}

interface WorkerState {
    workers: Worker[];
    isLoading: boolean;
    error: string | null;
    fetchWorkers: () => Promise<void>;
}

export const useWorkerStore = create<WorkerState>((set) => ({
    workers: [],
    isLoading: false,
    error: null,
    fetchWorkers: async () => {
        set({ isLoading: true, error: null });
        const token = useAdminStore.getState().token;
        
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/workers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                set({ workers: response.data.workers, isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    }
}));

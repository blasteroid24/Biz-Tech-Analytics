import { create } from 'zustand';

interface RequiemState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useRequiemStore = create<RequiemState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

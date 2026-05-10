import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface AdminInfo {
    id: string;
    username: string;
}

interface AdminState {
    isVerified: boolean;
    token: string | null;
    admin: AdminInfo | null;
    expiresAt: string | null;
    _hasHydrated: boolean;

    // Actions
    setAuth: (token: string, expiresAt: string, admin: AdminInfo) => void;
    clearAuth: () => void;
    validateTokenWithBackend: () => Promise<boolean>;
    logout: () => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            isVerified: false,
            token: null,
            admin: null,
            expiresAt: null,
            _hasHydrated: false,

            setAuth: (token, expiresAt, admin) => {
                set({
                    isVerified: true,
                    token,
                    expiresAt,
                    admin
                });
            },

            clearAuth: () => {
                set({
                    isVerified: false,
                    token: null,
                    expiresAt: null,
                    admin: null
                });
            },

            validateTokenWithBackend: async () => {
                try {
                    const { token } = get();
                    if (!token) {
                        set({ isVerified: false });
                        return false;
                    }

                    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/validatetoken`, {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true
                    });

                    if (response.data.success) {
                        set({ 
                            isVerified: true,
                            admin: response.data.admin
                        });
                        return true;
                    }
                    
                    set({ isVerified: false });
                    return false;
                } catch (error: any) {
                    set({ isVerified: false });
                    get().clearAuth();
                    return false;
                }
            },

            logout: async () => {
                const { token } = get();
                if (token) {
                    try {
                        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/logout`, {}, {
                            headers: { Authorization: `Bearer ${token}` },
                            withCredentials: true
                        });
                    } catch (error) {
                        console.error("Logout request failed", error);
                    }
                }
                get().clearAuth();
            }
        }),
        {
            name: "admin-storage",
            partialize: (state) => ({
                token: state.token,
                expiresAt: state.expiresAt,
                admin: state.admin,
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state._hasHydrated = true;
                }
            },
        }
    )
);

'use client'
import { useForm, SubmitHandler } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAdminStore } from "@/hooks/adminStore"
import { motion, AnimatePresence } from "motion/react"
import { FiLock, FiUser, FiArrowRight, FiShield } from "react-icons/fi"

type Inputs = {
    username: string
    password: string
}

const AdminLogin = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<Inputs>()
    const { isVerified, setAuth } = useAdminStore()
    const router = useRouter()
    const [loginError, setLoginError] = useState<string | null>(null)

    useEffect(() => {
        if (isVerified) {
            router.push("/")
        }
    }, [isVerified, router])

    const mutation = useMutation({
        mutationFn: async (formData: Inputs) => {
            const endpoint = `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/login`
            const { data } = await axios.post(endpoint, formData)
            return data
        },
        onSuccess: (data) => {
            if (data.success) {
                setAuth(data.sessionToken, data.expiresAt, data.admin || { id: data.adminId, username: data.username || "Admin" })
                router.push("/")
            }
        },
        onError: (error: any) => {
            setLoginError(error.response?.data?.message || "Access Denied: Invalid Credentials")
        }
    })

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        setLoginError(null)
        mutation.mutate(data)
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-md relative">
                {/* Branding */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                        <FiShield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">BizTech Analytics</h1>
                    <p className="text-sm text-muted-foreground font-medium italic">Manufacturing Intelligence</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border shadow-xl rounded-3xl p-8"
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                                Administrator Identification
                            </label>
                            <div className="relative group">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    {...register("username", { required: "Identification is required" })}
                                    placeholder="Username"
                                    className="w-full h-12 bg-secondary/50 border border-border rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                />
                            </div>
                            {errors.username && (
                                <p className="text-[11px] text-destructive font-bold ml-1">{errors.username.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                                Security Passcode
                            </label>
                            <div className="relative group">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    {...register("password", { required: "Security key is required" })}
                                    placeholder="••••••••"
                                    className="w-full h-12 bg-secondary/50 border border-border rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-[11px] text-destructive font-bold ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Action */}
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {mutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="uppercase tracking-widest text-xs">Authorize Access</span>
                                    <FiArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <AnimatePresence>
                            {loginError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-center"
                                >
                                    <p className="text-[10px] text-destructive font-bold uppercase tracking-tight">{loginError}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        Industrial Analytics System v2.0
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
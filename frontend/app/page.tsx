'use client'
import Dashboard from "@/components/admin/Dashboard";
import { useAdminStore } from '@/hooks/adminStore'
import AdminLogin from "./admin/page";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { validateTokenWithBackend, isVerified, _hasHydrated } = useAdminStore()
  const [isValidating, setIsValidating] = useState(true)
  const hasValidated = useRef(false)

  useEffect(() => {
    // Only validate once after hydration
    if (_hasHydrated && !hasValidated.current) {
      hasValidated.current = true
      validateTokenWithBackend().finally(() => {
        setIsValidating(false)
      })
    }
  }, [_hasHydrated])

  // Show loading state while hydrating or validating
  if (!_hasHydrated || isValidating) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050505]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full">
      {isVerified ? <Dashboard /> : <AdminLogin />}
    </div>
  );
}

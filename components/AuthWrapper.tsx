"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import type React from "react" // Added import for React

interface AuthWrapperProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function AuthWrapper({ children, allowedRoles }: AuthWrapperProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
    } else if (allowedRoles && !allowedRoles.includes(session.user?.role as string)) {
      router.push("/")
    }
  }, [session, status, router, allowedRoles])

  if (status === "loading") {
    return <LoadingSpinner />
  }

  if (!session || (allowedRoles && !allowedRoles.includes(session.user?.role as string))) {
    return null
  }

  return <>{children}</>
}


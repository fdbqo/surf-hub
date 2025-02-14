"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"

interface User {
  _id: string
  username: string
  displayName: string
  email: string
  role: "user" | "moderator" | "admin"
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<"user" | "moderator" | "admin" | "">("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated" || session?.user.role !== "admin") {
      router.push("/")
    } else if (status === "authenticated" && session.user.role === "admin") {
      fetchUser()
    }
  }, [session, status, router])

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`)
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setRole(userData.role)
      } else {
        throw new Error("Failed to fetch user")
      }
    } catch (error) {
      setError("An error occurred while fetching user data. Please try again.")
    }
  }

  const handleRoleChange = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        setSuccess("User role updated successfully")
        setError(null)
      } else {
        throw new Error("Failed to update user role")
      }
    } catch (error) {
      setError("An error occurred while updating the user role. Please try again.")
      setSuccess(null)
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated" || (session && session.user.role !== "admin")) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.push("/admin/users")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mb-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {user && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Username:</p>
                <p>{user.username}</p>
              </div>
              <div>
                <p className="font-semibold">Display Name:</p>
                <p>{user.displayName}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{user.email}</p>
              </div>
              <div>
                <p className="font-semibold">Role:</p>
                <Select value={role} onValueChange={(value: "user" | "moderator" | "admin") => setRole(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleRoleChange}>Update Role</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


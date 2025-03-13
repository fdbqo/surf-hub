"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, ImageIcon, MapPin } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { SpotForm } from "./spot-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

interface SurfSpot {
  _id: string
  name: string
  description: string
  location: {
    type: string
    coordinates: [number, number]
  }
  difficulty: number
  waveType: string
  bestSeason: string
  imageUrl?: string
  averageWaveHeight?: number
  windDirection?: string
  waterTemperature?: number
  createdAt: string
  updatedAt: string
}

export default function AdminSpotsPage() {
  const [spots, setSpots] = useState<SurfSpot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSpot, setEditingSpot] = useState<SurfSpot | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "admin")) {
      router.push("/")
    } else if (status === "authenticated" && session.user.role === "admin") {
      fetchSpots()
    }
  }, [session, status, router])

  const fetchSpots = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/spots")
      if (!response.ok) {
        throw new Error("Failed to fetch spots")
      }
      const data = await response.json()
      setSpots(data)
    } catch (error) {
      console.error("Error fetching spots:", error)
      setError("Failed to load surf spots. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/spots/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete spot")
      }

      setSpots(spots.filter((spot) => spot._id !== id))
      toast({
        title: "Spot deleted",
        description: "The surf spot has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting spot:", error)
      toast({
        title: "Error",
        description: "Failed to delete the surf spot. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (spot: SurfSpot) => {
    setEditingSpot(spot)
    setShowForm(true)
  }

  const handleFormSubmit = () => {
    setShowForm(false)
    setEditingSpot(null)
    fetchSpots()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingSpot(null)
  }

  if (status === "loading" || isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchSpots} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Surf Spots</CardTitle>
          <Button onClick={() => setShowForm(true)} className="bg-primary">
            <Plus className="mr-2 h-4 w-4" /> Add New Spot
          </Button>
        </CardHeader>
        <CardContent>
          {spots.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-lg font-medium">No surf spots found</p>
              <p className="text-sm text-muted-foreground">Get started by creating a new surf spot.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Wave Type</TableHead>
                    <TableHead>Best Season</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spots.map((spot) => (
                    <TableRow key={spot._id}>
                      <TableCell>
                        <div className="relative h-12 w-16 rounded overflow-hidden">
                          {spot.imageUrl ? (
                            <Image
                              src={spot.imageUrl || "/placeholder.svg"}
                              alt={spot.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{spot.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          {spot.location.coordinates.join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={spot.difficulty > 3 ? "destructive" : "secondary"}>{spot.difficulty}/5</Badge>
                      </TableCell>
                      <TableCell>{spot.waveType}</TableCell>
                      <TableCell>{spot.bestSeason}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(spot)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the surf spot "{spot.name}". This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(spot._id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && <SpotForm spot={editingSpot} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />}
    </div>
  )
}


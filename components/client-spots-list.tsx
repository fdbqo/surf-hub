"use client"

import { useState, useEffect } from "react"
import { SpotCard } from "@/components/spot-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Waves } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ClientSpotsListProps {
  search: string
  difficulty: string
  waveType: string
  season: string
  sort: string
}

interface SurfSpot {
  _id: string
  name: string
  description: string
  difficulty: number
  waveType: string
  bestSeason: string
  imageUrl?: string
  averageWaveHeight?: number
  windDirection?: string
  waterTemperature?: number
}

export function ClientSpotsList({ search, difficulty, waveType, season, sort }: ClientSpotsListProps) {
  const [spots, setSpots] = useState<SurfSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSpots() {
      setLoading(true)
      setError(null)

      try {
        // Build query parameters
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (difficulty && difficulty !== "any") params.set("difficulty", difficulty)
        if (waveType && waveType !== "any") params.set("waveType", waveType)
        if (season && season !== "any") params.set("season", season)
        if (sort) params.set("sort", sort)

        const response = await fetch(`/api/spots?${params.toString()}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch spots")
        }

        const data = await response.json()
        console.log("API response:", data)

        if (data.spots && Array.isArray(data.spots)) {
          setSpots(data.spots)
        } else {
          console.error("Invalid data format:", data)
          setSpots([])
        }
      } catch (err) {
        console.error("Error fetching spots:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchSpots()
  }, [search, difficulty, waveType, season, sort])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (spots.length === 0) {
    return (
      <div className="text-center py-12">
        <Waves className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-semibold">No surf spots found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your filters or check back later for new spots.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {spots.map((spot) => (
        <SpotCard
          key={spot._id}
          id={spot._id}
          name={spot.name}
          description={spot.description}
          difficulty={spot.difficulty}
          waveType={spot.waveType}
          bestSeason={spot.bestSeason}
          imageUrl={spot.imageUrl}
          averageWaveHeight={spot.averageWaveHeight}
          windDirection={spot.windDirection}
          waterTemperature={spot.waterTemperature}
        />
      ))}
    </div>
  )
}


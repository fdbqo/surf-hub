"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ImageUpload } from "./image-upload"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
}

interface SpotFormProps {
  spot: SurfSpot | null
  onSubmit: () => void
  onCancel: () => void
}

const WAVE_TYPES = ["Beach Break", "Reef Break", "Point Break", "River Mouth", "Sandbar", "Jetty", "Other"]

const SEASONS = [
  "Spring",
  "Summer",
  "Autumn",
  "Winter",
  "Year-round",
  "Spring and Autumn",
  "Autumn and Winter",
  "Winter and Spring",
  "Summer and Autumn",
]

const WIND_DIRECTIONS = [
  "North",
  "Northeast",
  "East",
  "Southeast",
  "South",
  "Southwest",
  "West",
  "Northwest",
  "Offshore",
  "Onshore",
  "Cross-shore",
]

export function SpotForm({ spot, onSubmit, onCancel }: SpotFormProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | undefined>(spot?.imageUrl)

  // Form state
  const [name, setName] = useState(spot?.name || "")
  const [description, setDescription] = useState(spot?.description || "")
  const [latitude, setLatitude] = useState(spot?.location.coordinates[0].toString() || "")
  const [longitude, setLongitude] = useState(spot?.location.coordinates[1].toString() || "")
  const [difficulty, setDifficulty] = useState(spot?.difficulty.toString() || "3")
  const [waveType, setWaveType] = useState(spot?.waveType || "")
  const [bestSeason, setBestSeason] = useState(spot?.bestSeason || "")
  const [averageWaveHeight, setAverageWaveHeight] = useState(
    spot?.averageWaveHeight ? spot.averageWaveHeight.toString() : "",
  )
  const [windDirection, setWindDirection] = useState(spot?.windDirection || "")
  const [waterTemperature, setWaterTemperature] = useState(
    spot?.waterTemperature ? spot.waterTemperature.toString() : "",
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Validate required fields
      if (!name || !description || !latitude || !longitude || !difficulty || !waveType || !bestSeason) {
        throw new Error("Please fill in all required fields")
      }

      // Validate coordinates
      const lat = Number.parseFloat(latitude)
      const lng = Number.parseFloat(longitude)
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Coordinates must be valid numbers")
      }

      const spotData = {
        name,
        description,
        location: {
          type: "Point",
          coordinates: [lat, lng] as [number, number],
        },
        difficulty: Number.parseInt(difficulty),
        waveType,
        bestSeason,
        imageUrl,
        ...(averageWaveHeight ? { averageWaveHeight: Number.parseFloat(averageWaveHeight) } : {}),
        ...(windDirection ? { windDirection } : {}),
        ...(waterTemperature ? { waterTemperature: Number.parseFloat(waterTemperature) } : {}),
      }

      const url = spot ? `/api/admin/spots/${spot._id}` : "/api/admin/spots"
      const method = spot ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(spotData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save surf spot")
      }

      toast({
        title: spot ? "Spot updated" : "Spot created",
        description: spot
          ? "The surf spot has been successfully updated."
          : "The new surf spot has been successfully created.",
      })

      onSubmit()
    } catch (error) {
      console.error("Error saving spot:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUploaded = (url: string) => {
    setImageUrl(url)
  }

  return (
    <Dialog open={true} onOpenChange={() => !isSubmitting && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{spot ? "Edit Surf Spot" : "Add New Surf Spot"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-right">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="description" className="text-right">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude" className="text-right">
                    Latitude <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 54.2766"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude" className="text-right">
                    Longitude <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. -8.5965"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-right">
                  Difficulty <span className="text-red-500">*</span>
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Beginner</SelectItem>
                    <SelectItem value="2">2 - Beginner-Intermediate</SelectItem>
                    <SelectItem value="3">3 - Intermediate</SelectItem>
                    <SelectItem value="4">4 - Intermediate-Advanced</SelectItem>
                    <SelectItem value="5">5 - Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="waveType" className="text-right">
                  Wave Type <span className="text-red-500">*</span>
                </Label>
                <Select value={waveType} onValueChange={setWaveType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WAVE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bestSeason" className="text-right">
                  Best Season <span className="text-red-500">*</span>
                </Label>
                <Select value={bestSeason} onValueChange={setBestSeason} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select best season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="averageWaveHeight" className="text-right">
                  Average Wave Height (meters)
                </Label>
                <Input
                  id="averageWaveHeight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={averageWaveHeight}
                  onChange={(e) => setAverageWaveHeight(e.target.value)}
                  placeholder="e.g. 1.5"
                />
              </div>

              <div>
                <Label htmlFor="windDirection" className="text-right">
                  Preferred Wind Direction
                </Label>
                <Select value={windDirection} onValueChange={setWindDirection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wind direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {WIND_DIRECTIONS.map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {direction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="waterTemperature" className="text-right">
                  Water Temperature (°C)
                </Label>
                <Input
                  id="waterTemperature"
                  type="number"
                  step="0.1"
                  min="0"
                  value={waterTemperature}
                  onChange={(e) => setWaterTemperature(e.target.value)}
                  placeholder="e.g. 15.5"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="block mb-2">Spot Image</Label>
            <ImageUpload initialImage={imageUrl} onImageUploaded={handleImageUploaded} />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {spot ? "Update Spot" : "Create Spot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


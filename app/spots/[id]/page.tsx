import { notFound } from "next/navigation"
import Image from "next/image"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { SurfSpot } from "@/models/SurfSpot"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Waves, Wind, Thermometer, Calendar, MapPin, User, Clock } from "lucide-react"
import { format } from "date-fns"

async function getSurfSpot(id: string) {
  try {
    await connectToDatabase()
    const spot = await SurfSpot.findById(id).populate("createdBy", "username displayName").lean()

    return spot
  } catch (error) {
    console.error("Error fetching surf spot:", error)
    return null
  } finally {
    await disconnectFromDatabase()
  }
}

export default async function SpotDetailPage({ params }: { params: { id: string } }) {
  const spot = await getSurfSpot(params.id)

  if (!spot) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative h-[400px] w-full mb-6 rounded-lg overflow-hidden">
            <Image
              src={spot.imageUrl || `/placeholder.svg?height=800&width=1200`}
              alt={spot.name}
              fill
              className="object-cover"
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">{spot.name}</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant={spot.difficulty > 3 ? "destructive" : "secondary"}>Difficulty: {spot.difficulty}/5</Badge>
            <Badge variant="outline">{spot.waveType}</Badge>
            <Badge variant="outline">Best in {spot.bestSeason}</Badge>
          </div>

          <div className="prose max-w-none dark:prose-invert mb-8">
            <p>{spot.description}</p>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Surf Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <Waves className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Average Wave Height</p>
                  <p className="text-lg font-medium">{spot.averageWaveHeight ? `${spot.averageWaveHeight}m` : "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <Wind className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Wind Direction</p>
                  <p className="text-lg font-medium">{spot.windDirection || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <Thermometer className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Water Temperature</p>
                  <p className="text-lg font-medium">{spot.waterTemperature ? `${spot.waterTemperature}°C` : "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Best Season</p>
                  <p className="text-lg font-medium">{spot.bestSeason}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="relative h-[200px] w-full mb-4 bg-muted rounded-md flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground absolute bottom-2 right-2">Map view coming soon</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Sligo, Ireland</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Spot Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Added by: {spot.createdBy?.displayName || "Admin"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Added: {format(new Date(spot.createdAt), "MMMM d, yyyy")}</span>
                </div>
                {spot.updatedAt && spot.updatedAt !== spot.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Updated: {format(new Date(spot.updatedAt), "MMMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


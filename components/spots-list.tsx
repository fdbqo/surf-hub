import { SurfSpot } from "@/models/SurfSpot"
import { SpotCard } from "@/components/spot-card"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Waves } from "lucide-react"

interface SpotsListProps {
  search: string
  difficulty: string
  waveType: string
  season: string
  sort: string
}

async function getSurfSpots({ search, difficulty, waveType, season, sort }: SpotsListProps) {
  try {
    await connectToDatabase()

    const query: any = {}

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    if (difficulty && difficulty !== "any") {
      query.difficulty = Number.parseInt(difficulty)
    }

    if (waveType && waveType !== "any") {
      query.waveType = waveType
    }

    if (season && season !== "any") {
      query.bestSeason = season
    }

    console.log("Query:", JSON.stringify(query))

    let sortOption = {}
    switch (sort) {
      case "name":
        sortOption = { name: 1 }
        break
      case "difficulty-asc":
        sortOption = { difficulty: 1 }
        break
      case "difficulty-desc":
        sortOption = { difficulty: -1 }
        break
      case "newest":
        sortOption = { createdAt: -1 }
        break
      default:
        sortOption = { name: 1 }
    }

    console.log("Sort option:", JSON.stringify(sortOption))

    const spots = await SurfSpot.find(query).sort(sortOption).populate("createdBy", "username displayName").lean()

    console.log(`Found ${spots.length} spots`)
    return spots
  } catch (error) {
    console.error("Error fetching surf spots:", error)
    throw new Error("Failed to load surf spots")
  } finally {
    await disconnectFromDatabase()
  }
}

export async function SpotsList({ search, difficulty, waveType, season, sort }: SpotsListProps) {
  try {
    const spots = await getSurfSpots({
      search,
      difficulty,
      waveType,
      season,
      sort,
    })

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
  } catch (error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load surf spots. Please try again later.</AlertDescription>
      </Alert>
    )
  }
}


import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { SpotsList } from "@/components/spots-list"
import { SpotFilters } from "@/components/spot-filters"
import { LoadingSpinner } from "@/components/loading-spinner"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { SurfSpot } from "@/models/SurfSpot"

async function getFilterOptions() {
  try {
    await connectToDatabase()
    const [waveTypes, seasons] = await Promise.all([SurfSpot.distinct("waveType"), SurfSpot.distinct("bestSeason")])
    console.log("Filter options:", { waveTypes, seasons })
    return { waveTypes, seasons }
  } catch (error) {
    console.error("Error fetching filter options:", error)
    return { waveTypes: [], seasons: [] }
  } finally {
    await disconnectFromDatabase()
  }
}

export default async function SpotsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { waveTypes, seasons } = await getFilterOptions()

  const search = typeof searchParams.search === "string" ? searchParams.search : ""
  const difficulty = typeof searchParams.difficulty === "string" ? searchParams.difficulty : ""
  const waveType = typeof searchParams.waveType === "string" ? searchParams.waveType : ""
  const season = typeof searchParams.season === "string" ? searchParams.season : ""
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "name"

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Surf Spots" description="Discover the best surfing locations in Sligo" />

      <SpotFilters
        waveTypes={waveTypes.length > 0 ? waveTypes : ["Beach Break", "Reef Break", "Point Break"]}
        seasons={seasons.length > 0 ? seasons : ["Spring", "Summer", "Autumn", "Winter"]}
        initialValues={{
          search,
          difficulty,
          waveType,
          season,
          sort,
        }}
      />

      <Suspense fallback={<LoadingSpinner />}>
        <SpotsList search={search} difficulty={difficulty} waveType={waveType} season={season} sort={sort} />
      </Suspense>
    </div>
  )
}


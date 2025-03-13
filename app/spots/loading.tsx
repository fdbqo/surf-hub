import { LoadingSpinner } from "@/components/loading-spinner"
import { PageHeader } from "@/components/page-header"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Surf Spots" description="Discover the best surfing locations in Sligo" />
      <div className="h-[200px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </div>
  )
}


import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SpotPreviewCardProps {
  id: string
  name: string
  difficulty: number
  waveType: string
  bestSeason: string
  imageUrl?: string
}

export function SpotPreviewCard({ id, name, difficulty, waveType, bestSeason, imageUrl }: SpotPreviewCardProps) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/5 mb-6">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-32 sm:h-auto sm:w-32 flex-shrink-0">
            <Image src={imageUrl || `/placeholder.svg?height=200&width=200`} alt={name} fill className="object-cover" />
          </div>
          <div className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-primary mr-1" />
                <h3 className="font-semibold">{name}</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant={difficulty > 3 ? "destructive" : "secondary"}>Difficulty: {difficulty}/5</Badge>
                <Badge variant="outline">{waveType}</Badge>
                <Badge variant="outline">Best in {bestSeason}</Badge>
              </div>
            </div>
            <Button variant="link" asChild className="self-end p-0">
              <Link href={`/spots/${id}`}>View Spot Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


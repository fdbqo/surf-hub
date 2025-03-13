import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Waves, Wind, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LinkedSpotCardProps {
  id: string
  name: string
  difficulty: number
  waveType: string
  bestSeason: string
  imageUrl?: string
  averageWaveHeight?: number
  windDirection?: string
  compact?: boolean
}

export function LinkedSpotCard({
  id,
  name,
  difficulty,
  waveType,
  bestSeason,
  imageUrl,
  averageWaveHeight,
  windDirection,
  compact = false,
}: LinkedSpotCardProps) {
  if (compact) {
    return (
      <Link
        href={`/spots/${id}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        <MapPin className="h-3.5 w-3.5" />
        <span className="text-sm font-medium">{name}</span>
      </Link>
    )
  }

  return (
    <Card className="overflow-hidden border-primary/20 hover:border-primary/40 transition-colors">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-40 sm:h-auto sm:w-40 flex-shrink-0">
            <Image src={imageUrl || `/placeholder.svg?height=160&width=160`} alt={name} fill className="object-cover" />
            <Badge variant={difficulty > 3 ? "destructive" : "secondary"} className="absolute top-2 right-2">
              {difficulty}/5
            </Badge>
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-primary mr-1.5" />
                <h3 className="font-semibold text-lg">{name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <Waves className="h-4 w-4 text-muted-foreground mr-1.5" />
                  <span>{waveType}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-1.5" />
                  <span>Best in {bestSeason}</span>
                </div>
                {averageWaveHeight && (
                  <div className="flex items-center text-sm">
                    <Waves className="h-4 w-4 text-muted-foreground mr-1.5" />
                    <span>{averageWaveHeight}m waves</span>
                  </div>
                )}
                {windDirection && (
                  <div className="flex items-center text-sm">
                    <Wind className="h-4 w-4 text-muted-foreground mr-1.5" />
                    <span>{windDirection}</span>
                  </div>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" asChild className="self-end gap-1.5">
              <Link href={`/spots/${id}`}>
                <span>View Spot Details</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


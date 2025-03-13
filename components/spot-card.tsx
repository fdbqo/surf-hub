import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Waves, Wind, Thermometer, Calendar } from "lucide-react"

interface SpotCardProps {
  id: string
  name: string
  description?: string
  difficulty: number
  waveType: string
  bestSeason: string
  imageUrl?: string
  averageWaveHeight?: number
  windDirection?: string
  waterTemperature?: number
}

export function SpotCard({
  id,
  name,
  description,
  difficulty,
  waveType,
  bestSeason,
  imageUrl,
  averageWaveHeight,
  windDirection,
  waterTemperature,
}: SpotCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative h-48 w-full">
        <Image src={imageUrl || `/placeholder.svg?height=400&width=600`} alt={name} fill className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{name}</span>
          <Badge variant={difficulty > 3 ? "destructive" : "secondary"}>{difficulty}/5</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {description && <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Waves className="h-4 w-4 text-primary" />
            <span>{waveType}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{bestSeason}</span>
          </div>
          {averageWaveHeight && (
            <div className="flex items-center gap-1">
              <Waves className="h-4 w-4 text-primary" />
              <span>{averageWaveHeight}m</span>
            </div>
          )}
          {windDirection && (
            <div className="flex items-center gap-1">
              <Wind className="h-4 w-4 text-primary" />
              <span>{windDirection}</span>
            </div>
          )}
          {waterTemperature && (
            <div className="flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-primary" />
              <span>{waterTemperature}°C</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/spots/${id}`} className="text-primary hover:underline w-full text-center">
          View Details
        </Link>
      </CardFooter>
    </Card>
  )
}


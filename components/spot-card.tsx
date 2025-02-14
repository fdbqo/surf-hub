import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SpotCardProps {
  id: string
  name: string
  difficulty: number
  waveType: string
  bestSeason: string
}

export function SpotCard({ id, name, difficulty, waveType, bestSeason }: SpotCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <Badge variant="secondary">Difficulty: {difficulty}/5</Badge>
          <p>
            <strong>Wave Type:</strong> {waveType}
          </p>
          <p>
            <strong>Best Season:</strong> {bestSeason}
          </p>
          <Link href={`/spots/${id}`} className="text-primary hover:underline">
            View Details
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


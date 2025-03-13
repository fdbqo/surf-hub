"use client"

import * as React from "react"
import Image from "next/image"
import { Check, MapPin, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export interface SurfSpot {
  _id: string
  name: string
  difficulty: number
  waveType: string
  bestSeason: string
  imageUrl?: string
}

interface SpotSelectorProps {
  selectedSpot: SurfSpot | null
  onSelectSpot: (spot: SurfSpot | null) => void
  className?: string
}

export function SpotSelector({ selectedSpot, onSelectSpot, className }: SpotSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [spots, setSpots] = React.useState<SurfSpot[]>([])
  const [loading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState("")

  // Fetch spots when opened or when query changes
  React.useEffect(() => {
    if (!open) return

    const fetchSpots = async () => {
      setLoading(true)
      try {
        const searchParam = query ? `&search=${encodeURIComponent(query)}` : ""
        const response = await fetch(`/api/spots?limit=10${searchParam}`)
        if (response.ok) {
          const data = await response.json()
          setSpots(data.spots)
        }
      } catch (error) {
        console.error("Error fetching spots:", error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce the search
    const timer = setTimeout(fetchSpots, 300)
    return () => clearTimeout(timer)
  }, [open, query])

  const handleSelect = (spot: SurfSpot) => {
    onSelectSpot(spot._id === selectedSpot?._id ? null : spot)
    setOpen(false)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedSpot ? (
              <div className="flex items-center gap-2 text-left">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{selectedSpot.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Link a surf spot (optional)</span>
              </div>
            )}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search surf spots..." value={query} onValueChange={setQuery} className="h-9" />
            <CommandList>
              <CommandEmpty>{loading ? "Searching..." : "No surf spots found."}</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {loading
                  ? // Loading skeletons
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                          <Skeleton className="h-10 w-10 rounded-md" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      ))
                  : spots.map((spot) => (
                      <CommandItem
                        key={spot._id}
                        value={spot._id}
                        onSelect={() => handleSelect(spot)}
                        className="flex items-center gap-2 py-2"
                      >
                        <div className="relative h-10 w-10 overflow-hidden rounded-md flex-shrink-0">
                          <Image
                            src={spot.imageUrl || `/placeholder.svg?height=40&width=40`}
                            alt={spot.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <p className="truncate font-medium">{spot.name}</p>
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4 flex-shrink-0",
                                selectedSpot?._id === spot._id ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Badge
                              variant={spot.difficulty > 3 ? "destructive" : "secondary"}
                              className="text-[10px] px-1 py-0 h-auto"
                            >
                              {spot.difficulty}/5
                            </Badge>
                            <span className="truncate">
                              {spot.waveType} • {spot.bestSeason}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSpot && (
        <div className="rounded-md border bg-primary/5 p-3 flex items-center gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
            <Image
              src={selectedSpot.imageUrl || `/placeholder.svg?height=64&width=64`}
              alt={selectedSpot.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{selectedSpot.name}</h4>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onSelectSpot(null)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove spot</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant={selectedSpot.difficulty > 3 ? "destructive" : "secondary"}>
                Difficulty: {selectedSpot.difficulty}/5
              </Badge>
              <Badge variant="outline">{selectedSpot.waveType}</Badge>
              <Badge variant="outline">{selectedSpot.bestSeason}</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


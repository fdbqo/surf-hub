"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CardFooter } from "@/components/ui/card"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface SpotFiltersProps {
  waveTypes: string[]
  seasons: string[]
  initialValues: {
    search: string
    difficulty: string
    waveType: string
    season: string
    sort: string
  }
}

export function SpotFilters({ waveTypes, seasons, initialValues }: SpotFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialValues.search)
  const [difficulty, setDifficulty] = useState(initialValues.difficulty)
  const [waveType, setWaveType] = useState(initialValues.waveType)
  const [season, setSeason] = useState(initialValues.season)
  const [sort, setSort] = useState(initialValues.sort)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // For temporary state while dialog is open
  const [tempDifficulty, setTempDifficulty] = useState(difficulty)
  const [tempWaveType, setTempWaveType] = useState(waveType)
  const [tempSeason, setTempSeason] = useState(season)

  const hasActiveFilters = difficulty || waveType || season || search

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)

    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }

    if (difficulty) {
      params.set("difficulty", difficulty)
    } else {
      params.delete("difficulty")
    }

    if (waveType) {
      params.set("waveType", waveType)
    } else {
      params.delete("waveType")
    }

    if (season) {
      params.set("season", season)
    } else {
      params.delete("season")
    }

    if (sort && sort !== "name") {
      params.set("sort", sort)
    } else {
      params.delete("sort")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const resetFilters = () => {
    setSearch("")
    setDifficulty("")
    setWaveType("")
    setSeason("")
    setSort("name")
    setTempDifficulty("")
    setTempWaveType("")
    setTempSeason("")
    router.push(pathname)
  }

  const handleApplyDialogFilters = () => {
    setDifficulty(tempDifficulty)
    setWaveType(tempWaveType)
    setSeason(tempSeason)
    setIsDialogOpen(false)

    // Use setTimeout to ensure state is updated before applying filters
    setTimeout(() => {
      applyFilters()
    }, 0)
  }

  const handleDialogOpen = (open: boolean) => {
    if (open) {
      // Initialize temp values when opening
      setTempDifficulty(difficulty)
      setTempWaveType(waveType)
      setTempSeason(season)
    }
    setIsDialogOpen(open)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== initialValues.search) {
        applyFilters()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Update temp values when initialValues change
  useEffect(() => {
    setDifficulty(initialValues.difficulty)
    setWaveType(initialValues.waveType)
    setSeason(initialValues.season)
    setSort(initialValues.sort)

    setTempDifficulty(initialValues.difficulty)
    setTempWaveType(initialValues.waveType)
    setTempSeason(initialValues.season)
  }, [initialValues])

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search surf spots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8"
              onClick={() => {
                setSearch("")
                applyFilters()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value)
            setTimeout(applyFilters, 0)
          }}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="difficulty-asc">Difficulty (Easiest first)</SelectItem>
            <SelectItem value="difficulty-desc">Difficulty (Hardest first)</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto relative">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Filter Surf Spots</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={tempDifficulty} onValueChange={setTempDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Any difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any difficulty</SelectItem>
                    <SelectItem value="1">1 - Beginner</SelectItem>
                    <SelectItem value="2">2 - Beginner-Intermediate</SelectItem>
                    <SelectItem value="3">3 - Intermediate</SelectItem>
                    <SelectItem value="4">4 - Intermediate-Advanced</SelectItem>
                    <SelectItem value="5">5 - Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waveType">Wave Type</Label>
                <Select value={tempWaveType} onValueChange={setTempWaveType}>
                  <SelectTrigger id="waveType">
                    <SelectValue placeholder="Any wave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any wave type</SelectItem>
                    {waveTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">Best Season</Label>
                <Select value={tempSeason} onValueChange={setTempSeason}>
                  <SelectTrigger id="season">
                    <SelectValue placeholder="Any season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any season</SelectItem>
                    {seasons.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setTempDifficulty("any")
                  setTempWaveType("any")
                  setTempSeason("any")
                }}
              >
                Reset
              </Button>
              <Button onClick={handleApplyDialogFilters}>Apply Filters</Button>
            </CardFooter>
          </DialogContent>
        </Dialog>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-3">
          <span>Active filters:</span>
          {difficulty && (
            <Badge variant="outline" className="bg-secondary/50">
              Difficulty: {difficulty}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  setDifficulty("")
                  applyFilters()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {waveType && (
            <Badge variant="outline" className="bg-secondary/50">
              {waveType}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  setWaveType("")
                  applyFilters()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {season && (
            <Badge variant="outline" className="bg-secondary/50">
              Season: {season}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => {
                  setSeason("")
                  applyFilters()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}


import { AuthWrapper } from "@/components/AuthWrapper"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { WavesIcon } from "lucide-react"
import { connectToDatabase } from "@/lib/mongodb"
import { FORUM_TAGS } from "@/lib/constants"
import { ForumTopic } from "@/models"
import type React from "react"

async function getTagCounts() {
  let connection
  try {
    connection = await connectToDatabase()
    const tagCounts = await ForumTopic.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Create a map of all possible tags with their counts
    const counts = new Map(FORUM_TAGS.map((tag) => [tag, 0]))
    tagCounts.forEach(({ _id, count }) => {
      if (counts.has(_id)) {
        counts.set(_id, count)
      }
    })

    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
  } catch (error) {
    console.error("Error fetching tag counts:", error)
    return FORUM_TAGS.map((tag) => ({ name: tag, count: 0 }))
  }
}

export default async function ForumLayout({ children }: { children: React.ReactNode }) {
  const tags = await getTagCounts()

  return (
    <AuthWrapper>
      <div className="container flex-1 items-start px-4 md:px-6 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <ScrollArea className="py-6 pr-6 lg:py-8">
            <div className="flex items-center gap-2 px-4 mb-4">
              <WavesIcon className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">Forum Categories</h2>
            </div>
            <div className="space-y-4">
              <div className="px-4 py-2">
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/forum">
                      <span className="flex-1 text-left">All Topics</span>
                    </Link>
                  </Button>
                  {tags.map((tag) => (
                    <Button key={tag.name} variant="ghost" className="w-full justify-start" asChild>
                      <Link href={`/forum?search=${encodeURIComponent(tag.name)}`}>
                        <span className="flex-1 text-left">{tag.name}</span>
                        <span className="ml-auto text-muted-foreground">[{tag.count}]</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>
        <main className="flex w-full flex-col overflow-hidden pr-6 md:pr-0">{children}</main>
      </div>
    </AuthWrapper>
  )
}


import { Suspense } from "react"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { ForumTopicCard } from "@/components/forum-topic-card"
import { PageHeader } from "@/components/page-header"
import { CreateTopicButton } from "@/components/create-topic-button"
import { connectToDatabase } from "@/lib/mongodb"
import { ForumTopic } from "@/models" // Import from index file

async function getTopics(page: number, limit: number, search: string) {
  let connection
  try {
    connection = await connectToDatabase()

    const skip = (page - 1) * limit

    const query = search
      ? { $or: [{ title: { $regex: search, $options: "i" } }, { tags: { $in: [new RegExp(search, "i")] } }] }
      : {}

    const [topics, total] = await Promise.all([
      ForumTopic.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username displayName")
        .lean(),
      ForumTopic.countDocuments(query),
    ])

    // Collect all unique tags
    const allTags = await ForumTopic.distinct("tags")

    return {
      topics,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTopics: total,
      allTags,
    }
  } catch (error) {
    console.error("Error fetching topics:", error)
    throw new Error("Failed to fetch topics")
  }
}

function ForumTopics({ topics, totalPages }: { topics: any[]; totalPages: number }) {
  return (
    <div>
      {topics.map((topic) => (
        <ForumTopicCard
          key={topic._id}
          id={topic._id}
          title={topic.title}
          author={topic.author?.displayName || "Unknown"}
          replies={topic.replies?.length || 0}
          lastActivity={topic.updatedAt}
          tags={topic.tags}
          upvotes={topic.upvotes?.length || 0}
          downvotes={topic.downvotes?.length || 0}
        />
      ))}
    </div>
  )
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  const session = await getServerSession()
  if (!session) {
    redirect("/login?callbackUrl=/forum")
  }

  const search = searchParams.search || ""
  const page = Number.parseInt(searchParams.page || "1", 10)

  try {
    const { topics, totalPages, allTags } = await getTopics(page, 10, search)

    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Sligo Surf Forum" description="Join the conversation about surfing in Sligo" />

        <CreateTopicButton />

        <Suspense fallback={<div>Loading topics...</div>}>
          <ForumTopics topics={topics} totalPages={totalPages} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error in ForumPage:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Sligo Surf Forum" description="Join the conversation about surfing in Sligo" />
        <div className="text-center py-8">
          <p className="text-red-500">An error occurred while loading the forum. Please try again later.</p>
          <p className="text-sm text-muted-foreground mt-2">If the problem persists, please contact support.</p>
        </div>
      </div>
    )
  }
}


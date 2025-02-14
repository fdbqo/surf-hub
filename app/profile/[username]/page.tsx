import { notFound } from "next/navigation"
import { connectToDatabase, disconnectFromDatabase } from "@/lib/mongodb"
import { User } from "@/models/User"
import { ForumTopic } from "@/models/ForumTopic"
import { SurfSpot } from "@/models/SurfSpot"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ForumTopicCard } from "@/components/forum-topic-card"
import { SpotCard } from "@/components/spot-card"

async function getUserProfile(username: string) {
  await connectToDatabase()
  try {
    const user = await User.findOne({ username }).select("-password").lean()

    if (!user) {
      return null
    }

    const popularTopics = await ForumTopic.find({ author: user._id }).sort({ replies: -1 }).limit(5).lean()

    const favoriteSpots = await SurfSpot.find({ _id: { $in: user.favoriteSpots } }).lean()

    return {
      ...user,
      popularTopics,
      favoriteSpots,
    }
  } finally {
    await disconnectFromDatabase()
  }
}

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const profile = await getUserProfile(params.username)

  if (!profile) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardContent className="flex flex-col md:flex-row items-center p-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-0 md:mr-6">
            <AvatarImage src={`https://avatar.vercel.sh/${profile.username}.png`} alt={profile.displayName} />
            <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{profile.displayName}</h1>
            <p className="text-muted-foreground mb-4">@{profile.username}</p>
            {profile.bio && <p className="text-sm">{profile.bio}</p>}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="topics" className="mb-8">
        <TabsList>
          <TabsTrigger value="topics">Popular Topics</TabsTrigger>
          <TabsTrigger value="spots">Favorite Spots</TabsTrigger>
        </TabsList>
        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.popularTopics && profile.popularTopics.length > 0 ? (
                profile.popularTopics.map((topic) => (
                  <ForumTopicCard
                    key={topic._id}
                    id={topic._id}
                    title={topic.title}
                    author={profile.displayName}
                    replies={topic.replies?.length || 0}
                    lastActivity={topic.updatedAt}
                    tags={topic.tags}
                  />
                ))
              ) : (
                <p>No popular topics yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="spots">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Surf Spots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.favoriteSpots && profile.favoriteSpots.length > 0 ? (
                  profile.favoriteSpots.map((spot) => (
                    <SpotCard
                      key={spot._id}
                      id={spot._id}
                      name={spot.name}
                      difficulty={spot.difficulty}
                      waveType={spot.waveType}
                      bestSeason={spot.bestSeason}
                    />
                  ))
                ) : (
                  <p>No favorite spots yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { ForumTopicCard } from "@/components/forum-topic-card"
import { SpotCard } from "@/components/spot-card"
import { UserList } from "@/components/user-list"
import { LoadingSpinner } from "@/components/loading-spinner"

interface User {
  id: string
  username: string
  displayName: string
  email: string
  bio?: string
  profilePicture?: string
  role?: "user" | "admin" | "moderator"
  followers?: string[]
  following?: string[]
  favoriteSpots?: any[]
  popularForums?: any[]
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile")
    } else if (status === "authenticated" && session?.user?.email) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`/api/user?email=${session.user.email}`)
          if (response.ok) {
            const userData: User = await response.json()
            setUser(userData)
          } else {
            console.error("Failed to fetch user data")
            setUser(null)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        } finally {
          setIsLoading(false)
        }
      }
      fetchUserData()
    }
  }, [session, status, router])

  if (status === "loading" || isLoading) {
    return <LoadingSpinner />
  }

  if (status === "unauthenticated") {
    return null // The useEffect hook will handle redirection
  }

  if (!user) {
    return <div>Error loading user data. Please try again.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardContent className="flex flex-col md:flex-row items-center p-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-0 md:mr-6">
            <AvatarImage
              src={user.profilePicture || `https://avatar.vercel.sh/${user.username}.png`}
              alt={user.displayName}
            />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">{user.displayName}</h1>
            <p className="text-muted-foreground mb-4">@{user.username}</p>
            <div className="flex justify-center md:justify-start space-x-4 mb-4">
              <Button variant="outline" onClick={() => setShowFollowers(true)}>
                <Users className="mr-2 h-4 w-4" /> {user.followers?.length || 0} Followers
              </Button>
              <Button variant="outline" onClick={() => setShowFollowing(true)}>
                <Users className="mr-2 h-4 w-4" /> {user.following?.length || 0} Following
              </Button>
            </div>
            <p className="text-sm">{user.bio || "No bio available"}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="forums" className="mb-8">
        <TabsList>
          <TabsTrigger value="forums">Popular Forums</TabsTrigger>
          <TabsTrigger value="spots">Favorite Spots</TabsTrigger>
        </TabsList>
        <TabsContent value="forums">
          <Card>
            <CardHeader>
              <CardTitle>Popular Forums</CardTitle>
            </CardHeader>
            <CardContent>
              {user.popularForums && user.popularForums.length > 0 ? (
                user.popularForums.map((forum: any) => (
                  <ForumTopicCard
                    key={forum._id}
                    id={forum._id}
                    title={forum.title}
                    author={user.displayName}
                    replies={forum.replies?.length || 0}
                    lastActivity={new Date(forum.updatedAt).toLocaleString()}
                    tags={forum.tags || []}
                    preview=""
                  />
                ))
              ) : (
                <p>No popular forums yet.</p>
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
                {user.favoriteSpots && user.favoriteSpots.length > 0 ? (
                  user.favoriteSpots.map((spot) => (
                    <SpotCard
                      key={spot.id}
                      id={spot.id}
                      name={spot.name || "Unknown Spot"}
                      difficulty={spot.difficulty || 0}
                      waveType={spot.waveType || "Unknown"}
                      bestSeason={spot.bestSeason || "Unknown"}
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

      {showFollowers && user.followers && (
        <UserList
          title="Followers"
          users={user.followers.map((id) => ({ id, name: "", username: "" }))}
          onClose={() => setShowFollowers(false)}
        />
      )}

      {showFollowing && user.following && (
        <UserList
          title="Following"
          users={user.following.map((id) => ({ id, name: "", username: "" }))}
          onClose={() => setShowFollowing(false)}
        />
      )}
    </div>
  )
}


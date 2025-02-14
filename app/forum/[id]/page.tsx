"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ForumTopic {
  _id: string
  title: string
  content: string
  author: {
    _id: string
    username: string
    displayName: string
  }
  createdAt: string
  updatedAt: string
  tags: string[]
}

interface ForumReply {
  _id: string
  content: string
  author: {
    _id: string
    username: string
    displayName: string
  }
  createdAt: string
}

export default function ForumThreadPage() {
  const { id } = useParams()
  const [topic, setTopic] = useState<ForumTopic | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("oldest")
  const [replyContent, setReplyContent] = useState("")
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login?callbackUrl=/forum/" + id)
    },
  })
  const router = useRouter()

  useEffect(() => {
    const fetchTopicData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/forum/${id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        setTopic(data.topic)
        setReplies(data.replies)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
        console.error("Error fetching topic data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchTopicData()
    }
  }, [id])

  const handleReply = async () => {
    try {
      const response = await fetch("/api/forum/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topicId: id,
          content: replyContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post reply")
      }

      const newReply = await response.json()
      setReplies([...replies, newReply])
      setReplyContent("")
      toast({
        title: "Reply posted",
        description: "Your reply has been successfully posted.",
      })
    } catch (err) {
      console.error("Error posting reply:", err)
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTopic = async () => {
    try {
      const response = await fetch(`/api/forum/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete topic")
      }

      router.push("/forum")
      toast({
        title: "Topic deleted",
        description: "The topic has been successfully deleted.",
      })
    } catch (err) {
      console.error("Error deleting topic:", err)
      toast({
        title: "Error",
        description: "Failed to delete topic. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    try {
      const response = await fetch(`/api/forum/reply/${replyId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete reply")
      }

      setReplies(replies.filter((reply) => reply._id !== replyId))
      toast({
        title: "Reply deleted",
        description: "The reply has been successfully deleted.",
      })
    } catch (err) {
      console.error("Error deleting reply:", err)
      toast({
        title: "Error",
        description: "Failed to delete reply. Please try again.",
        variant: "destructive",
      })
    }
  }

  const sortedReplies = [...replies].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  if (status === "loading" || isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!topic) {
    return <div>Topic not found</div>
  }

  return (
    <div className="py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="mb-8 bg-primary/5">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Link href={`/profile/${topic.author?.username}`} className="flex items-center mb-6">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${topic.author?.username || "unknown"}.png`}
                    alt={topic.author?.displayName || "Unknown User"}
                  />
                  <AvatarFallback>{topic.author?.displayName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{topic.author?.displayName || "Unknown User"}</p>
                  <p className="text-sm text-muted-foreground">
                    {topic.createdAt ? new Date(topic.createdAt).toLocaleString() : "Unknown date"}
                  </p>
                </div>
              </Link>
              {(session?.user.id === topic.author._id || session?.user.role === "admin") && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this topic?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the topic and all its replies.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteTopic}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>
            <div className="flex flex-wrap gap-2">
              {topic.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="bg-primary/10">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <p className="mb-6 text-lg">{topic.content}</p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-6 mt-12">
          <h2 className="text-2xl font-semibold">Replies</h2>
          <Select onValueChange={(value) => setSortBy(value as "newest" | "oldest")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sortedReplies.map((reply) => (
          <Card key={reply._id} className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <Link href={`/profile/${reply.author?.username}`} className="flex items-center mb-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${reply.author?.username || "unknown"}.png`}
                      alt={reply.author?.displayName || "Unknown User"}
                    />
                    <AvatarFallback>{reply.author?.displayName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{reply.author?.displayName || "Unknown User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : "Unknown date"}
                    </p>
                  </div>
                </Link>
                {(session?.user.id === reply.author._id || session?.user.role === "admin") && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this reply?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteReply(reply._id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <p className="mb-2 text-sm">{reply.content}</p>
            </CardContent>
          </Card>
        ))}

        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Leave a Reply</h3>
            <Textarea
              placeholder="Type your reply here..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-4"
            />
            <Button onClick={handleReply}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Post Reply
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Search, AlertTriangle, CheckCircle, Trash2, MessageSquare, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
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
import { format } from "date-fns"

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
  reportCount?: number
  isReviewed?: boolean
}

interface ForumReply {
  _id: string
  content: string
  author: {
    _id: string
    username: string
    displayName: string
  }
  topic: {
    _id: string
    title: string
  }
  createdAt: string
  reportCount?: number
  isReviewed?: boolean
}

export default function AdminModerationPage() {
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [contentType, setContentType] = useState<"all" | "topics" | "replies">("all")
  const [status, setStatus] = useState<"all" | "flagged" | "reported">("all")
  const [search, setSearch] = useState("")

  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (sessionStatus === "unauthenticated" || (session && session.user.role !== "admin")) {
      router.push("/")
    } else if (sessionStatus === "authenticated" && session.user.role === "admin") {
      // Initialize from URL params if available
      const pageParam = searchParams.get("page")
      const typeParam = searchParams.get("type") as "all" | "topics" | "replies" | null
      const statusParam = searchParams.get("status") as "all" | "flagged" | "reported" | null
      const searchParam = searchParams.get("search")

      if (pageParam) setCurrentPage(Number.parseInt(pageParam))
      if (typeParam) setContentType(typeParam)
      if (statusParam) setStatus(statusParam)
      if (searchParam) setSearch(searchParam)

      fetchContent()
    }
  }, [session, sessionStatus, router, currentPage, contentType, status])

  const fetchContent = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        type: contentType,
        status: status,
      })

      if (search) {
        queryParams.append("search", search)
      }

      const response = await fetch(`/api/admin/moderation?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch content")
      }

      const data = await response.json()

      setTopics(data.topics || [])
      setReplies(data.replies || [])
      setTotalPages(data.totalPages)
      setTotalItems(data.totalItems)
      setError(null)
    } catch (err) {
      console.error("Error fetching moderation content:", err)
      setError("Failed to load content. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchContent()

    // Update URL params
    const params = new URLSearchParams(searchParams)
    params.set("search", search)
    router.push(`/admin/moderation?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    // Update URL params
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    router.push(`/admin/moderation?${params.toString()}`)
  }

  const handleTypeChange = (value: "all" | "topics" | "replies") => {
    setContentType(value)
    setCurrentPage(1)

    // Update URL params
    const params = new URLSearchParams(searchParams)
    params.set("type", value)
    params.set("page", "1")
    router.push(`/admin/moderation?${params.toString()}`)
  }

  const handleStatusChange = (value: "all" | "flagged" | "reported") => {
    setStatus(value)
    setCurrentPage(1)

    // Update URL params
    const params = new URLSearchParams(searchParams)
    params.set("status", value)
    params.set("page", "1")
    router.push(`/admin/moderation?${params.toString()}`)
  }

  const handleAction = async (id: string, type: "topic" | "reply", action: "delete" | "approve") => {
    try {
      const response = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, type, action }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} ${type}`)
      }

      // Update local state
      if (action === "delete") {
        if (type === "topic") {
          setTopics(topics.filter((topic) => topic._id !== id))
        } else {
          setReplies(replies.filter((reply) => reply._id !== id))
        }
      } else if (action === "approve") {
        if (type === "topic") {
          setTopics(topics.map((topic) => (topic._id === id ? { ...topic, isReviewed: true } : topic)))
        } else {
          setReplies(replies.map((reply) => (reply._id === id ? { ...reply, isReviewed: true } : reply)))
        }
      }

      toast({
        title: "Success",
        description: `Content has been ${action === "delete" ? "deleted" : "approved"}.`,
      })
    } catch (err) {
      console.error(`Error ${action}ing ${type}:`, err)
      toast({
        title: "Error",
        description: `Failed to ${action} content. Please try again.`,
        variant: "destructive",
      })
    }
  }

  if (sessionStatus === "loading" || isLoading) {
    return <LoadingSpinner />
  }

  if (sessionStatus === "unauthenticated" || (session && session.user.role !== "admin")) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <CardDescription>
            Review and moderate forum topics and replies that may contain inappropriate content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            <div className="flex gap-2">
              <Select value={contentType} onValueChange={(v) => handleTypeChange(v as any)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All content</SelectItem>
                  <SelectItem value="topics">Topics only</SelectItem>
                  <SelectItem value="replies">Replies only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(v) => handleStatusChange(v as any)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All content</SelectItem>
                  <SelectItem value="flagged">Auto-flagged</SelectItem>
                  <SelectItem value="reported">User reported</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
              <p className="mt-4 text-lg font-medium">{error}</p>
              <Button onClick={fetchContent} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No content to moderate</p>
              <p className="text-sm text-muted-foreground">
                All content has been reviewed or no content matches your filters.
              </p>
            </div>
          ) : (
            <Tabs defaultValue="topics" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="topics" disabled={contentType === "replies"}>
                  <FileText className="mr-2 h-4 w-4" />
                  Topics {topics.length > 0 && `(${topics.length})`}
                </TabsTrigger>
                <TabsTrigger value="replies" disabled={contentType === "topics"}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Replies {replies.length > 0 && `(${replies.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="topics">
                {topics.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No topics to moderate</p>
                ) : (
                  <div className="space-y-4">
                    {topics.map((topic) => (
                      <Card key={topic._id} className={topic.isReviewed ? "border-green-500/50" : ""}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{topic.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>By: {topic.author.displayName}</span>
                                <span>•</span>
                                <span>{format(new Date(topic.createdAt), "MMM d, yyyy")}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {topic.reportCount && topic.reportCount > 0 && (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Reported ({topic.reportCount})
                                </Badge>
                              )}
                              {topic.isReviewed && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="bg-muted/50 p-3 rounded-md my-2 text-sm">{topic.content}</div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {topic.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex justify-end gap-2 mt-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this topic? This action cannot be undone and will
                                    also delete all replies to this topic.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleAction(topic._id, "topic", "delete")}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {!topic.isReviewed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(topic._id, "topic", "approve")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="replies">
                {replies.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No replies to moderate</p>
                ) : (
                  <div className="space-y-4">
                    {replies.map((reply) => (
                      <Card key={reply._id} className={reply.isReviewed ? "border-green-500/50" : ""}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                Reply to: <span className="text-primary">{reply.topic.title}</span>
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>By: {reply.author.displayName}</span>
                                <span>•</span>
                                <span>{format(new Date(reply.createdAt), "MMM d, yyyy")}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {reply.reportCount && reply.reportCount > 0 && (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Reported ({reply.reportCount})
                                </Badge>
                              )}
                              {reply.isReviewed && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="bg-muted/50 p-3 rounded-md my-2 text-sm">{reply.content}</div>

                          <div className="flex justify-end gap-2 mt-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Reply</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this reply? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleAction(reply._id, "reply", "delete")}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {!reply.isReviewed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(reply._id, "reply", "approve")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}


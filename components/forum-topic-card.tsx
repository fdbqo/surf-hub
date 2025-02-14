import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForumTopicCardProps {
  id: string
  title: string
  author: string
  replies: number
  lastActivity: string
  tags: string[]
  preview?: string
}

export function ForumTopicCard({ id, title, author, replies, lastActivity, tags, preview }: ForumTopicCardProps) {
  const formatLastActivity = (activity: string) => {
    const date = new Date(activity)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffSeconds = Math.floor(diffTime / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""} ago`
  }

  return (
    <Link href={`/forum/${id}`}>
      <Card
        className={cn(
          "mb-4 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors",
          "hover:shadow-md",
        )}
      >
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold line-clamp-1">{title}</h2>
              {preview && <p className="text-sm text-muted-foreground line-clamp-1">{preview}</p>}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>{author}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span>{replies} replies</span>
                </div>
              </div>
              <div className="text-right">
                <span>Last activity: {formatLastActivity(lastActivity)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


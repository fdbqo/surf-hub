"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FORUM_TAGS, type ForumTag } from "@/lib/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CreateTopicFormProps {
  onSuccess: () => void
}

export function CreateTopicForm({ onSuccess }: CreateTopicFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<ForumTag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  const handleAddTag = (tag: ForumTag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tagToRemove: ForumTag) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) return
    if (selectedTags.length === 0) {
      setError("Please select at least one tag")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          author: session.user.id,
          tags: selectedTags,
        }),
      })

      if (response.ok) {
        setTitle("")
        setContent("")
        setSelectedTags([])
        router.refresh()
        onSuccess()
      } else {
        const errorData = await response.json()
        if (errorData.errors) {
          // Handle Zod validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
            .join("\n")
          setError(`Validation errors:\n${errorMessages}`)
        } else {
          setError(errorData.message || "Failed to create topic")
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error Creating Topic</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
        </Alert>
      )}
      <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Topic title" required />
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Topic content" required />
      <div className="space-y-2">
        <Select onValueChange={(value: ForumTag) => handleAddTag(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select tags" />
          </SelectTrigger>
          <SelectContent>
            {FORUM_TAGS.map((tag) => (
              <SelectItem key={tag} value={tag} disabled={selectedTags.includes(tag)}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Topic"}
      </Button>
    </form>
  )
}


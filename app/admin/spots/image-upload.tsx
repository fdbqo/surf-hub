"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { X, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  initialImage?: string
  onImageUploaded: (url: string) => void
}

export function ImageUpload({ initialImage, onImageUploaded }: ImageUploadProps) {
  const [image, setImage] = useState<string | undefined>(initialImage)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      setImage(data.url)
      onImageUploaded(data.url)

      toast({
        title: "Image uploaded",
        description: "Your image has been successfully uploaded.",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = () => {
    setImage(undefined)
    onImageUploaded("")
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />

      {image ? (
        <div className="relative">
          <Card className="overflow-hidden">
            <div className="relative h-64 w-full">
              <Image src={image || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
            </div>
            <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}>
              <X className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      ) : (
        <Card
          className="border-dashed border-2 p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">Click to upload an image</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 5MB</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}


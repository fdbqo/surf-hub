import mongoose from "mongoose"
import { FORUM_TAGS } from "@/lib/constants"

const ForumTopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [
      {
        type: String,
        enum: FORUM_TAGS,
        required: true,
      },
    ],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "ForumReply" }],
    // Add linked spot reference
    linkedSpot: { type: mongoose.Schema.Types.ObjectId, ref: "SurfSpot" },
    // Moderation fields
    reportCount: { type: Number, default: 0 },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isReviewed: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
  },
)

// Add index for tags to improve query performance
ForumTopicSchema.index({ tags: 1 })
ForumTopicSchema.index({ content: "text", title: "text" })
ForumTopicSchema.index({ reportCount: 1 })
ForumTopicSchema.index({ isReviewed: 1 })
ForumTopicSchema.index({ linkedSpot: 1 }) // Add index for linkedSpot

export const ForumTopic = mongoose.models.ForumTopic || mongoose.model("ForumTopic", ForumTopicSchema)


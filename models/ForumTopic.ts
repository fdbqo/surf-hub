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
  },
  {
    timestamps: true,
  },
)

// Add index for tags to improve query performance
ForumTopicSchema.index({ tags: 1 })

export const ForumTopic = mongoose.models.ForumTopic || mongoose.model("ForumTopic", ForumTopicSchema)


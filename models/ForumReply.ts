import mongoose from "mongoose"

const ForumReplySchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "ForumTopic", required: true },
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

// Add indexes for moderation
ForumReplySchema.index({ content: "text" })
ForumReplySchema.index({ reportCount: 1 })
ForumReplySchema.index({ isReviewed: 1 })

export const ForumReply = mongoose.models.ForumReply || mongoose.model("ForumReply", ForumReplySchema)


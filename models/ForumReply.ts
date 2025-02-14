import mongoose from "mongoose"

const ForumReplySchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "ForumTopic", required: true },
  },
  {
    timestamps: true,
  },
)

export const ForumReply = mongoose.models.ForumReply || mongoose.model("ForumReply", ForumReplySchema)


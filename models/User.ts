import mongoose from "mongoose"
import "./SurfSpot"

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    bio: { type: String },
    profilePicture: { type: String },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    favoriteSpots: [{ type: mongoose.Schema.Types.ObjectId, ref: "SurfSpot" }],
    popularForums: [{ type: mongoose.Schema.Types.ObjectId, ref: "ForumTopic" }],
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.models.User || mongoose.model("User", UserSchema)


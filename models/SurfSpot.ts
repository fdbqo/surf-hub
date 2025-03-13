import mongoose from "mongoose"

const SurfSpotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    waveType: { type: String, required: true },
    bestSeason: { type: String, required: true },
    imageUrl: { type: String },
    averageWaveHeight: { type: Number },
    windDirection: { type: String },
    waterTemperature: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
)

SurfSpotSchema.index({ location: "2dsphere" })
SurfSpotSchema.index({ name: 1 })
SurfSpotSchema.index({ waveType: 1 })
SurfSpotSchema.index({ bestSeason: 1 })
SurfSpotSchema.index({ difficulty: 1 })

export const SurfSpot = mongoose.models.SurfSpot || mongoose.model("SurfSpot", SurfSpotSchema)


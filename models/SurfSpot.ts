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

// Create a 2dsphere index on the location field for geospatial queries
SurfSpotSchema.index({ location: "2dsphere" })

export const SurfSpot = mongoose.models.SurfSpot || mongoose.model("SurfSpot", SurfSpotSchema)


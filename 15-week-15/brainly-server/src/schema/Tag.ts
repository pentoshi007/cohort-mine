import mongoose, { Model } from "mongoose";

export interface ITag {
  title: string;
  userId: mongoose.Types.ObjectId;
}

const tagSchema = new mongoose.Schema<ITag>(
  {
    title: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique tags per user
tagSchema.index({ title: 1, userId: 1 }, { unique: true });

export const TagModel: Model<ITag> = mongoose.model<ITag>("Tag", tagSchema);

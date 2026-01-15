import mongoose, { Model } from "mongoose";

export type ContentType = "note" | "video" | "tweet" | "link";

interface IContent {
  title: string;
  type: ContentType;
  link?: string;
  content?: string; // For notes
  tags: mongoose.Types.ObjectId[];
  userId: mongoose.Types.ObjectId;
}

const contentSchema = new mongoose.Schema<IContent>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["note", "video", "tweet", "link"],
      default: "link",
    },
    link: { type: String },
    content: { type: String }, // For notes
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
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

export const ContentModel: Model<IContent> = mongoose.model<IContent>(
  "Content",
  contentSchema
);


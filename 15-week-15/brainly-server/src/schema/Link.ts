import { model, Schema, Model } from "mongoose";
interface ILink {
  hash: string;
  userId: Schema.Types.ObjectId;
}
const linkSchema = new Schema<ILink>(
  {
    hash: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);
export const LinkModel: Model<ILink> = model<ILink>("Link", linkSchema);

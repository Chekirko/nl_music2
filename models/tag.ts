import { Schema, model, models, Document } from "mongoose";

export interface ITag {
  name: string;
  songsCount: number;
}

export interface ITagDoc extends ITag, Document {}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    songsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Tag = models?.Tag || model<ITag>("Tag", TagSchema);

export default Tag;

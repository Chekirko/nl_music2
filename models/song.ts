import { Schema, model, models } from "mongoose";

const SongSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  rythm: {
    type: String,
    required: [false, "rythm is not required"],
  },
  comment: {
    type: String,
    required: [false, "Comment is not required"],
  },
  tags: {
    type: String,
    required: [false, "Tags is not required"],
  },
  key: {
    type: String,
    required: [true, "Key is required"],
  },
  mode: {
    type: String,
    required: [false, "Video is not required"],
  },
  blocks: {
    type: [
      {
        name: { type: String, required: false },
        version: { type: Number, required: true },
        lines: String,
        ind: { type: Number, required: true },
      },
    ],
    required: [true, "Blocks is required"],
  },
  origin: {
    type: String,
    required: [false, "Origin is not required"],
  },
  video: {
    type: String,
    required: [false, "Video is not required"],
  },
  ourVideo: {
    type: String,
    required: [false, "OurVideo is not required"],
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  copiedFrom: {
    type: Schema.Types.ObjectId,
    ref: "Song",
    required: false,
  },
  copiedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  isOriginal: {
    type: Boolean,
    default: true,
  },
});

const Song = models.Song || model("Song", SongSchema);

export default Song;

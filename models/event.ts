import { Schema, model, models } from "mongoose";

const SongInEventSchema = new Schema({
  song: {
    type: Schema.Types.ObjectId,
    ref: "Song",
  },
  ind: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
});

const EventSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  songs: [SongInEventSchema],
  date: {
    type: Date,
    // default: Date.now(),
    required: [true, "Date is required"],
  },
});

const Event = models.Event || model("Event", EventSchema);

export default Event;

import { Schema, model, models } from "mongoose";

const TeamMemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "editor", "member"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [TeamMemberSchema],
    settings: {
      isPrivate: {
        type: Boolean,
        default: false,
      },
      allowCopying: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

const Team = models.Team || model("Team", TeamSchema);

export default Team;

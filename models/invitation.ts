import { Schema, model, models } from "mongoose";

const InvitationSchema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 днів
    },
  },
  { timestamps: true }
);

// Індекс для швидкого пошуку активних запрошень
InvitationSchema.index({ to: 1, status: 1 });
InvitationSchema.index({ team: 1, to: 1 });

const Invitation = models.Invitation || model("Invitation", InvitationSchema);

export default Invitation;

import { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["team_invite", "role_change", "removed_from_team", "team_update"],
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Індекс для швидкого пошуку непрочитаних
NotificationSchema.index({ user: 1, isRead: 1 });

const Notification =
  models.Notification || model("Notification", NotificationSchema);

export default Notification;

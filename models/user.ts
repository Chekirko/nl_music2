import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "please write your fullname"],
  },
  email: {
    type: String,
    required: [true, "please provide a valid email"],
    unique: true,
  },
  image: {
    type: String,
  },
  nickname: {
    type: String,
  },
  role: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  // Google OAuth fields
  googleId: {
    type: String,
  },
  authProvider: {
    type: String,
    enum: ["credentials", "google", "both"],
    default: "credentials",
  },
  // Password reset fields
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  activeTeam: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: false,
  },
  teams: [
    {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: false,
    },
  ],
});

const User = models.User || model("User", UserSchema);

export default User;

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
  role: {
    type: String,
    required: true,
  },
  password: {
    type: String,
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

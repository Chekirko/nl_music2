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
});

const User = models.User || model("User", UserSchema);

export default User;

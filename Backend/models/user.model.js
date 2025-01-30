import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "user",
  },
  profilePicture: {
    public_id: String,
    url: String
  },
});

const User = mongoose.model("User", userSchema);

export default User;

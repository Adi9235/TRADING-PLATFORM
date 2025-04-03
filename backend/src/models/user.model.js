import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    required: true,
    default: true,
  },
});

export default mongoose.model("User", userSchema);

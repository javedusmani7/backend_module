import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;
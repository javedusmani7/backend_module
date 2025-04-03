import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const News = mongoose.model("News", NewsSchema);
export default News;
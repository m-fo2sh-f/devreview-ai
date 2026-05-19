import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const snippetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  analysisResult: { type: Object, required: true },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Snippet = mongoose.models.Snippet || mongoose.model('Snippet', snippetSchema);

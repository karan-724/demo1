// models/Counter.js
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  count: { type: Number, default: 0 },
});

export default mongoose.models.Counter || mongoose.model('Counter', counterSchema);

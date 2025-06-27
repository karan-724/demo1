import mongoose from 'mongoose';

const PaymentSMSchema = new mongoose.Schema({
  message: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

// This is to prevent model recompilation errors in Next.js hot reload
export default mongoose.models.PaymentSMS || mongoose.model('PaymentSMS', PaymentSMSchema);

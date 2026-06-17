import mongoose from 'mongoose';

const { Schema } = mongoose;

const OTPSchema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    code: { 
      type: String, 
      required: true 
    },
    expiresAt: { 
      type: Date, 
      required: true 
    },
    isUsed: { 
      type: Boolean, 
      default: false 
    },
    purpose: {
      type: String,
      enum: ['LOGIN', 'REPORT_ACCESS', 'ACCOUNT_VERIFICATION'],
      required: true
    }
  },
  { timestamps: true }
);

// TTL Index: Automatically delete the document when the 'expiresAt' time is reached
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model('OTP', OTPSchema);
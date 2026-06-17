import mongoose from 'mongoose';

const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    generatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization' 
    },
    formId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Form' 
    },
    format: { 
      type: String, 
      enum: ['HTML', 'PDF', 'EXCEL'], 
      required: true 
    },
    fileUrl: { 
      type: String 
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Report', ReportSchema);
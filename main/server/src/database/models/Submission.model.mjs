import mongoose from 'mongoose';

const { Schema } = mongoose;

const SubmissionSchema = new Schema(
  {
    formId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Form', 
      required: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED'],
      default: 'DRAFT'
    },
    answers: [{
      questionId: { type: String, required: true },
      value: Schema.Types.Mixed 
    }]
  },
  { timestamps: true }
);

export default mongoose.model('Submission', SubmissionSchema);
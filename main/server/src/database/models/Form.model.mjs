import mongoose from 'mongoose';

const { Schema } = mongoose;

const FormSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    visibility: { 
      type: String, 
      enum: ['PUBLIC', 'PRIVATE'], // Private = Super Admin only
      default: 'PRIVATE' 
    },
    isMaster: { 
      type: Boolean, 
      default: true // True if created by Super Admin, False if it's an Org clone
    },
    clonedFromId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Form',
      default: null // Will hold the Master Form ID if cloned
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization',
      default: null // Null if it's a Master Form
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Form', FormSchema);
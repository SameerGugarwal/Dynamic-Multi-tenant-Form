import mongoose from "mongoose";
const { Schema } = mongoose;
const OrganizationSchema = new Schema({
    name: { 
      type: String, 
      required: true 
    },
    centers: [{
    type: Schema.Types.ObjectId,
    ref: 'Center',
    required: true
    }],
    contactEmail: { 
      type: String, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true });

  export default mongoose.model('Organization', OrganizationSchema);
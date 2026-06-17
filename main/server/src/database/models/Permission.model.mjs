import mongoose from 'mongoose';

const { Schema } = mongoose;

const PermissionSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true 
      // Example: 'CREATE_FORM', 'VIEW_REPORTS', 'MANAGE_USERS'
    },
    module: {
      type: String,
      required: true
      // Example: 'Forms', 'Organizations', 'Reports'
    },
    description: { 
      type: String 
    }
  },
  { timestamps: true }
);

export default mongoose.model('Permission', PermissionSchema);
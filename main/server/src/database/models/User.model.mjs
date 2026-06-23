import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    role: { 
      type: Schema.Types.ObjectId, 
      ref: 'Role', 
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization' 
      // Optional: Only required for end-users or organization admins
    },
    centerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Center' 
      // Optional: Required for center admins
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    refreshToken: {
      type: String,
      default: null
    }
},{
    timestamps : true,
});

// Mongoose Optimizations: Adding Indexes for performance
// UserSchema.index({ email: 1 });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ centerId: 1 });
UserSchema.index({ role: 1 });


export default mongoose.model('User', UserSchema);


// const UserSchema = new Schema({
//     name: { 
//       type: String, 
//       required: true 
//     },
//     email: { 
//       type: String, 
//       required: true, 
//       unique: true,
//       lowercase: true,
//       trim: true
//     },
//     passwordHash: { 
//       type: String, 
//       required: true 
//     },
//     role: { 
//       type: Schema.Types.ObjectId, 
//       ref: 'Role', 
//       required: true 
//     },
//     organizationId: { 
//       type: Schema.Types.ObjectId, 
//       ref: 'Organization' 
//       // Optional: Only required for end-users or organization admins
//     },
//     centerId: { 
//       type: Schema.Types.ObjectId, 
//       ref: 'Center' 
//       // Optional: Required for center admins
//     },
//     isActive: { 
//       type: Boolean, 
//       default: true 
//     },
//     refreshToken: {
//       type: String,
//       default: null
//     }
// },{
//     timestamps : true,
// });


// export default mongoose.model('User', UserSchema);
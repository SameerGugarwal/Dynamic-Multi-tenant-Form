//  this will define this main 4 roles: Super Admin, Center, Organization, and User
// paramneters : name , description, permitions 

import mongoose from 'mongoose';

const { Schema } = mongoose;

const RleSchema = new Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        enum: ['Super Admin', 'Center Admin', 'Organization Admin', 'User'],
    },
    description: {
        type: String,
    },
    permissions: [{
        type: Schema.Types.ObjectId,
        ref: 'Permission',
    }]
},{
    timestamps : true,
});

export default mongoose.model('Role', RleSchema);
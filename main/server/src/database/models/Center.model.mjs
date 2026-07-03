// parameters : name, contactEmail, phone, isActive

import mongoose from 'mongoose';
const { Schema } = mongoose;

const CenterSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    contactEmail: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    defaultTimezone: {
        type: String,
        default: 'UTC',
    }
},{
    timestamps : true,

});

export default mongoose.model('Center', CenterSchema);
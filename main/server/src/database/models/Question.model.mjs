import mongoose from 'mongoose';

const { Schema } = mongoose;

const QuestionSchema = new Schema(
  {
    formId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Form', 
      required: true 
    },
    label: { 
      type: String, 
      required: true 
    },
    fieldType: { 
      type: String, 
      enum: ['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'PHONE', 'DATE', 'TIME', 'RADIO', 'CHECKBOX', 'DROPDOWN', 'FILE', 'SIGNATURE'],
      required: true 
    },
    isRequired: { 
      type: Boolean, 
      default: false 
    },
    order: { 
      type: Number, 
      required: true // To maintain the sequence of questions
    },
    options: [{ 
      label: String, 
      value: String 
    }],
    validationRules: {
      min: Number,
      max: Number,
      regex: String
    },
    dependsOn: { 
      type: Schema.Types.ObjectId, 
      ref: 'Question',
      default: null
    },
    conditionValue: { 
      type: Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('Question', QuestionSchema);
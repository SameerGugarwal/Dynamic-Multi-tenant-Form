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
    // Inside Question.model.mjs
    logic: {
      action: {
        type: String,
        enum: ['SHOW', 'HIDE'],
        default: 'SHOW'
      },
      conditions: [{
        dependsOnQuestionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question'
        },
        operator: {
          type: String,
          enum: ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN']
        },
        value: {
          type: mongoose.Schema.Types.Mixed // Can be string, number, or boolean
        }
      }],
      conditionType: {
        type: String,
        enum: ['AND', 'OR'], // If multiple conditions exist, do they all need to be true (AND) or just one (OR)?
        default: 'AND'
      }
    }
  },
  { timestamps: true }
);


export default mongoose.model('Question', QuestionSchema);
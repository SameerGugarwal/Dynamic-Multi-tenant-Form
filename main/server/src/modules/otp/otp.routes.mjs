import express from 'express';
import Joi from 'joi';
import { requestNewOtp, verifyOtpSubmission } from './otp.controller.mjs';
import validate from '../../middleware/validation.middleware.mjs';

const router = express.Router();

// inline schema
const sendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  purpose: Joi.string().valid('LOGIN', 'REPORT_ACCESS', 'ACCOUNT_VERIFICATION').required()
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(), 
  purpose: Joi.string().valid('LOGIN', 'REPORT_ACCESS', 'ACCOUNT_VERIFICATION').required()
});

router.post('/send', validate(sendOtpSchema, 'body'), requestNewOtp);
router.post('/verify', validate(verifyOtpSchema, 'body'), verifyOtpSubmission);

export default router;
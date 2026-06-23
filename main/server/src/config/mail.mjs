import nodemailer from 'nodemailer';
import { env } from './env.mjs';
import { AppError } from '../shared/utils/errors.mjs';

const createTransporter = () => {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
        console.warn('[MAIL] SMTP Credentials are missing. Emails will not be sent.');
        // Return a mock transporter if credentials are missing
        return {
            verify: async () => false,
            sendMail: async (options) => {
                console.log(`[MOCK MAIL] Would have sent to: ${options.to}`);
                return { messageId: 'mock-id' };
            }
        };
    }

    return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT, 10),
        secure: parseInt(env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
        }
    });
};

const transporter = createTransporter();

// Verify connection health on boot
transporter.verify()
    .then((success) => {
        if(success) console.log('[MAIL] Server is ready to take our messages');
    })
    .catch((error) => {
        console.warn(`[MAIL] Verification failed: ${error.message}`);
    });

/**
 * Reusable async sendEmail utility
 * @param {Object} options - { to, subject, text, html }
 */
export const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"Dynamic Multi-tenant Form" <${env.SMTP_USER || 'no-reply@example.com'}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new AppError(`Failed to send email: ${error.message}`, 500);
    }
};

export default transporter;

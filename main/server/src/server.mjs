import express from "express"
import dotenv from "dotenv"
import morgan from 'morgan';

// Load and validate environment variables first
import { env } from './config/env.mjs';

import connectDB from "./config/db.mjs"
import router from './routes/index.mjs';
import { errorHandler } from './middleware/error.middleware.mjs';

// Security packages
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';

// Swagger documentation
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = env.PORT || 3501;

connectDB();// database connect karo 

// --- Swagger Configuration ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dynamic Multi-Tenant Form API',
      version: '1.0.0',
      description: 'API documentation for the Dynamic Multi-Tenant Form Management platform',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.mjs'], // Path to the API docs
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// --- End Swagger Configuration --- 

/*
// --- User's Original Code ---
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// --- End User's Original Code ---
*/

// --- Security Middleware ---
// Set security HTTP headers
app.use(helmet());

/*
// --- User's Original Code ---
// Enable CORS
app.use(cors());
// --- End User's Original Code ---
*/

// Enable Strict CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3501', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // !origin specifically Postman aur Swagger UI ko allow karne ke liye hai
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }
  },
  credentials: true // Cookies allow karne ke liye zaroori hai
}));
// Limit requests from same API
const limiter = rateLimit({
    max: 10000, // Limit each IP to 10000 requests per `window` (here, per 15 minutes) for development
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// --- End Security Middleware ---

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
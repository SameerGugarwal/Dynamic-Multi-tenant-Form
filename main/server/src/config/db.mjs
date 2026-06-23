import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();
/*
// --- User's Original Code ---
const connectDB = async () => {

    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
// --- End User's Original Code ---
*/

const MAX_RETRIES = 5;
let retryCount = 0;

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }

        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle disconnected events
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB connection lost. Trying to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully.');
        });

    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying MongoDB connection... (${retryCount}/${MAX_RETRIES}) in 5 seconds.`);
            setTimeout(connectDB, 5000);
        } else {
            console.error('Max connection retries reached. Exiting process.');
            process.exit(1);
        }
    }
};

export default connectDB;
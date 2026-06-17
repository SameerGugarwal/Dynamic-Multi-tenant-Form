import express from "express"
import dotenv from "dotenv"
import morgan from 'morgan';
import connectDB from "./config/db.mjs"
import router from './routes/index.mjs';
import { errorHandler } from './middleware/error.middleware.mjs';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3501;

connectDB();// database connect karo 

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
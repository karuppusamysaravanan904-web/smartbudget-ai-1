import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Centralized error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` SMARTBUDGET AI API Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` AI Provider: ${process.env.AI_PROVIDER || 'local'}`);
  console.log(`=========================================`);
});

export default app;

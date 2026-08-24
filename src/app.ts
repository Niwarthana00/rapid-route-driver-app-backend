import express from 'express';
import cors from 'cors';
import routes from './routes';
import { env } from './config/env';
import { globalErrorHandler } from './middleware/error';

const app = express();

// Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Rapid Route Driver App REST API Backend',
    database: env.DB_NAME,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/driver', routes);

// Global Error Middleware
app.use(globalErrorHandler);

export default app;

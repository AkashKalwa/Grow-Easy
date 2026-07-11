import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import importRouter from './routes/import.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for credentials and specific origin
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'https://groweasy-csv-importer.vercel.app' // Optional vercel URL
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for ease of test / production deployment, or restrict if strict
    }
  },
  credentials: true
}));

// Set large body parsing limit for large CSV transfers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import Router
app.use('/api', importRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'An internal server error occurred.',
    message: err.message || 'Unknown error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 GrowEasy Lead Importer Backend running on port ${PORT}`);
});

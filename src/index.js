import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import messagingRoutes from './routes/messaging.js';
import dataRoutes from './routes/data.js';
import eventsRoutes from './routes/events.js';
import habiticaRoutes from './routes/habitica.js';
import profileRoutes from './routes/profile.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.json({ 
    message: 'CTAAAPI is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Use route modules
app.use('/api/data', dataRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/habitica', habiticaRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/message', messagingRoutes);

// app.get('/api/tumbly', async (req, res) => {
//   const data = await lofiify();
//   res.json(data);
// });

app.listen(port, '0.0.0.0', () => {
  logger.info(`CTAAAPI Server is running on http://0.0.0.0:${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
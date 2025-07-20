import express from 'express';
import cors from 'cors'
import { doAll } from './logic.js'
import { fetchTasks } from './habitica.js';
//import lofiify  from './tumblrPosts.js';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import { listTodaysEvents } from './calendar.js';
import messagingRoutes from './routes/messaging.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({ 
    message: 'CTAAAPI is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/data', async (req, res) => {
  try {
    const data = await doAll();
    res.json(data);
  } catch (error) {
    console.error('Error fetching API data:', error);
    res.status(500).json({ error: 'Failed to fetch API data' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await listTodaysEvents();
    res.json(events);
  } catch (err) {
    console.error('Failed to fetch calendar events:', err);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

app.get('/api/habitica', async (req, res) => {
  try {
    const { habits, todos } = await fetchTasks();
    res.json({ habits, todos });
  } catch (error) {
    console.error('Error fetching tasks from Habitica:', error);
    res.status(500).json({ error: 'Failed to fetch Habitica tasks' });
  }
});

let profile = 'morning'

app.get('/api/profile', async (req, res) => {
  res.json({ profile });
})

app.post('/api/profile', async (req, res) => {
  const { profile: newProfile } = req.body;
  profile = newProfile;
  res.json({ profile });
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/message', messagingRoutes);

// app.get('/api/tumbly', async (req, res) => {
//   const data = await lofiify();
//   res.json(data);
// });

app.listen(port, '0.0.0.0', () => {
  console.log(`CTAAAPI Server is running on http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
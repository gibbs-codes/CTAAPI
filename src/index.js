import express from 'express';
import cors from 'cors'
import { doAll } from './logic.js'
//import lofiify  from './tumblrPosts.js';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import { listTodaysEvents } from './testCalendar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/data', async (req, res) => {
  const data = await doAll();
  res.json(data);
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await listTodaysEvents();
    res.json(events);
  } catch (err) {
    console.error('Failed to fetch calendar events:', err);
    res.status(500).send('Internal server error');
  }
});

// app.get('/api/tumbly', async (req, res) => {
//   const data = await lofiify();
//   res.json(data);
// });


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
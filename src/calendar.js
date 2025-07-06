import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import moment from 'moment-timezone';

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use service account instead of OAuth
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../service-account.json');
const TIMEZONE = 'America/Chicago';

function loadServiceAccountClient() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`Service account file not found at ${SERVICE_ACCOUNT_PATH}`);
    throw new Error(`Service account file not found at ${SERVICE_ACCOUNT_PATH}`);
  }
  
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH));
  
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
  });
  
  return auth;
}

export async function listTodaysEvents() {
  
  try {
    const auth = loadServiceAccountClient();
    const calendar = google.calendar({ version: 'v3', auth });
  
    const startOfDay = moment().tz(TIMEZONE).startOf('day').toISOString();
    const endOfDay = moment().tz(TIMEZONE).endOf('day').toISOString();
  
    const res = await calendar.events.list({
      calendarId: 'primary', // You may need to change this to your specific calendar ID
      timeMin: startOfDay,
      timeMax: endOfDay,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
  
    const events = res.data.items || [];
  
    return events.map(event => ({
      title: event.summary || 'No Title',
      description: event.description || '',
      location: event.location || '',
      start: moment(event.start.dateTime || event.start.date)
        .tz(TIMEZONE)
        .format('h:mm A'),
      end: moment(event.end.dateTime || event.end.date)
        .tz(TIMEZONE)
        .format('h:mm A'), 
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    // Return empty array instead of crashing the server
    return [];
  }
}
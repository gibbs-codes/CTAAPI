import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import moment from 'moment-timezone';

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, 'token.json');
// In container, credentials.json will be at the app root
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const TIMEZONE = 'America/Chicago';

function loadOAuthClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error(`Credentials file not found at ${CREDENTIALS_PATH}`);
    throw new Error(`Credentials file not found at ${CREDENTIALS_PATH}`);
  }
  
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  
  if (!fs.existsSync(TOKEN_PATH)) {
    console.error(`Token file not found at ${TOKEN_PATH}. You may need to run authentication first.`);
    throw new Error(`Token file not found at ${TOKEN_PATH}`);
  }
  
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

export async function listTodaysEvents() {
    try {
      const auth = loadOAuthClient();
      const calendar = google.calendar({ version: 'v3', auth });
    
      const startOfDay = moment().tz(TIMEZONE).startOf('day').toISOString();
      const endOfDay = moment().tz(TIMEZONE).endOf('day').toISOString();
    
      const res = await calendar.events.list({
        calendarId: 'primary',
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
      return []; // Return empty array instead of crashing
    }
}

// Remove the automatic execution for production
// const res = await listTodaysEvents().catch(console.error);
// console.log(res)
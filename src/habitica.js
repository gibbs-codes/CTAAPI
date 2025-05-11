import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const HABITICA_API_URL = 'https://habitica.com/api/v3';
const HEADERS = {
  'x-client': `${process.env.HABITICA_USER_ID}-CTAAPI`,
  'x-api-user': process.env.HABITICA_USER_ID,
  'x-api-key': process.env.HABITICA_API_KEY,
};

// Fetch habits and to-dos
export async function fetchTasks() {
  try {
    const response = await axios.get(`${HABITICA_API_URL}/tasks/user`, { headers: HEADERS });
    const habits = response.data.data.filter(task => task.type === 'habit');
    const todos = response.data.data.filter(task => task.type === 'todo');
    return { habits, todos };
  } catch (error) {
    console.error('Error fetching tasks from Habitica:', error);
    throw error;
  }
}

// Add a habit
export async function addHabit(name, notes = '') {
  try {
    const response = await axios.post(
      `${HABITICA_API_URL}/tasks/user`,
      {
        text: name,
        type: 'habit',
        notes,
      },
      { headers: HEADERS }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error adding habit to Habitica:', error);
    throw error;
  }
}

// Add a to-do
export async function addTodo(name, notes = '') {
  try {
    const response = await axios.post(
      `${HABITICA_API_URL}/tasks/user`,
      {
        text: name,
        type: 'todo',
        notes,
      },
      { headers: HEADERS }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error adding to-do to Habitica:', error);
    throw error;
  }
}
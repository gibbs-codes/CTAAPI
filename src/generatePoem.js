// generatePoem.js
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load .env file (optional if already loaded globally elsewhere)
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: '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',
});

// System prompt defining the AI's role
const systemPrompt = `
You are a poet primed to make aesthetic thought provoking tumblr style poems. 
These will be displayed over soft visuals and MUST be short, deep, to the point. 
Be optimistic as often as pessimistic. Find beauty and suffering, but not at the same time. 
Keep your poems less than 20 words. The shorter the better, less than 10 is ideal, less than 5 is incredible.
Your responses should be a single line string.
`;

/**
 * Generate a short poetic string with the given word count
 * @param {number} wordCount - Target number of words (suggested: 3–10)
 * @returns {Promise<string>} A short poem string
 */
export async function generatePoem(wordCount = 8) {
  try {
    const userPrompt = `poem ${wordCount} words`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 1,
      max_tokens: 60,
    });

    const poem = response.choices[0]?.message?.content?.trim();
    return poem || '[error: no content returned]';
  } catch (error) {
    console.error('OpenAI poem generation failed:', error);
    return '[error: failed to generate poem]';
  }
}


import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Note: Next.js automatically loads variables from .env into process.env for server-side code.
// For standalone Genkit scripts (like dev.ts), dotenv might need to be configured there.

// This line reads the GOOGLE_API_KEY from your .env file.
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  // This warning will appear in the server-side console (your terminal running `npm run dev`)
  // if the GOOGLE_API_KEY is not set.
  console.warn(
    'WARNING: GOOGLE_API_KEY is not set in environment variables. Genkit AI features will likely fail. Please ensure it is set in your .env file with your Gemini API key, and you have restarted the development server.'
  );
}

export const ai = genkit({
  // The googleAI plugin is initialized here.
  // If an apiKey is found (from GOOGLE_API_KEY in .env), it's passed to the plugin.
  plugins: [googleAI(apiKey ? { apiKey } : undefined)],
  // The default model for AI generation tasks.
  // We are using 'gemini-pro' as 'gemini-1.5-flash' and 'gemini-1.5-flash-latest' were not found.
  model: 'googleai/gemini-1.5-flash',
});


import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Removed GoogleAIPluginParams

// Note: Next.js automatically loads variables from .env into process.env
// For standalone Genkit scripts (like dev.ts), dotenv is usually configured there.

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  // This warning will appear in the server-side console (your terminal running `npm run dev`)
  // if the GOOGLE_API_KEY is not set.
  console.warn(
    'WARNING: GOOGLE_API_KEY is not set in environment variables. Genkit AI features will likely fail. Please ensure it is set in your .env file and you have restarted the development server.'
  );
}

export const ai = genkit({
  // Pass the apiKey in an object if it exists.
  // If apiKey is undefined, googleAI() might still attempt to use globally set environment variables.
  plugins: [googleAI(apiKey ? { apiKey } : undefined)],
  model: 'gemini-pro', // Using gemini-pro as previously decided
});


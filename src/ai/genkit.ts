
import {genkit} from 'genkit';
import {googleAI, GoogleAIPluginParams} from '@genkit-ai/googleai';

// Note: Next.js automatically loads variables from .env into process.env
// For standalone Genkit scripts (like dev.ts), dotenv is usually configured there.

const googleAIParams: GoogleAIPluginParams = {};

if (process.env.GOOGLE_API_KEY) {
  googleAIParams.apiKey = process.env.GOOGLE_API_KEY;
} else {
  // This warning will appear in the server-side console (your terminal running `npm run dev`)
  // if the GOOGLE_API_KEY is not set.
  console.warn(
    'WARNING: GOOGLE_API_KEY is not set in environment variables. Genkit AI features will likely fail. Please ensure it is set in your .env file and you have restarted the development server.'
  );
}

export const ai = genkit({
  plugins: [googleAI(googleAIParams)],
  model: 'gemini-1.5-flash', // Updated to a common, current model for text generation
});

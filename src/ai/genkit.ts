import {genkit} from 'genkit';
import {googleAI, GoogleAIPluginParams} from '@genkit-ai/googleai';

// Note: Next.js automatically loads variables from .env into process.env
// For standalone Genkit scripts (like dev.ts), dotenv is usually configured there.

const googleAIParams: GoogleAIPluginParams = {};
if (process.env.GOOGLE_API_KEY) {
  googleAIParams.apiKey = process.env.GOOGLE_API_KEY;
}

export const ai = genkit({
  plugins: [googleAI(googleAIParams)],
  model: 'gemini-1.5-flash-latest', // Updated to a common, current model for text generation
});

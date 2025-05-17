// src/ai/flows/generate-letter-draft.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized draft cover letters or motivation letters based on user input.
 *
 * - generateLetterDraft - A function that takes user details and generates a draft letter.
 * - GenerateLetterDraftInput - The input type for the generateLetterDraft function.
 * - GenerateLetterDraftOutput - The return type for the generateLetterDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLetterDraftInputSchema = z.object({
  background: z
    .string()
    .describe('A detailed description of the user background and experience.'),
  targetDetails: z
    .string()
    .describe('Details about the target job or university program.'),
  letterType: z.enum(['cover letter', 'motivation letter']).describe('The type of letter to generate.'),
});

export type GenerateLetterDraftInput = z.infer<typeof GenerateLetterDraftInputSchema>;

const GenerateLetterDraftOutputSchema = z.object({
  draft: z.string().describe('The generated draft cover letter or motivation letter.'),
});

export type GenerateLetterDraftOutput = z.infer<typeof GenerateLetterDraftOutputSchema>;

export async function generateLetterDraft(input: GenerateLetterDraftInput): Promise<GenerateLetterDraftOutput> {
  return generateLetterDraftFlow(input);
}

const generateLetterDraftPrompt = ai.definePrompt({
  name: 'generateLetterDraftPrompt',
  input: {schema: GenerateLetterDraftInputSchema},
  output: {schema: GenerateLetterDraftOutputSchema},
  prompt: `You are an expert in writing ${'{{letterType}}'}. Based on the user's background and the target job/university details, generate a personalized draft ${'{{letterType}}'}.\n\nUser Background: {{{background}}}\nTarget Details: {{{targetDetails}}}\n\nDraft ${'{{letterType}}'}:`, // Keep this on one line!
});

const generateLetterDraftFlow = ai.defineFlow(
  {
    name: 'generateLetterDraftFlow',
    inputSchema: GenerateLetterDraftInputSchema,
    outputSchema: GenerateLetterDraftOutputSchema,
  },
  async input => {
    const {output} = await generateLetterDraftPrompt(input);
    return output!;
  }
);

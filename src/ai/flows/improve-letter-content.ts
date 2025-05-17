// src/ai/flows/improve-letter-content.ts
'use server';

/**
 * @fileOverview AI-powered content improvement for cover letters and motivational letters.
 *
 * This file defines a Genkit flow that receives letter content and provides suggestions
 * for improving its content, grammar, and style. It ensures the letter is polished and effective.
 *
 * @module ai/flows/improve-letter-content
 *
 * @interface ImproveLetterContentInput - The input type for the improveLetterContent function.
 * @interface ImproveLetterContentOutput - The output type for the improveLetterContent function.
 * @function improveLetterContent - A function that processes letter content and returns improvement suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the improveLetterContent flow.
 * Defines the structure and validation rules for the input data.
 */
const ImproveLetterContentInputSchema = z.object({
  letterContent: z
    .string()
    .describe('The content of the letter that needs improvement.'),
  targetJobOrUniversity: z
    .string()
    .optional()
    .describe('The target job or university for the letter.'),
  userBackground: z
    .string()
    .optional()
    .describe('Background information about the user.'),
});

/**
 * Type definition for the input of the improveLetterContent flow.
 */
export type ImproveLetterContentInput = z.infer<typeof ImproveLetterContentInputSchema>;

/**
 * Output schema for the improveLetterContent flow.
 * Defines the structure and validation rules for the output data.
 */
const ImproveLetterContentOutputSchema = z.object({
  improvedContent: z
    .string()
    .describe('The improved content of the letter with suggestions applied.'),
  suggestions: z.array(
    z.string().describe('Specific suggestions for improving the letter.')
  ),
});

/**
 * Type definition for the output of the improveLetterContent flow.
 */
export type ImproveLetterContentOutput = z.infer<typeof ImproveLetterContentOutputSchema>;

/**
 * improveLetterContent function.
 *
 * @param {ImproveLetterContentInput} input - The input data for the flow.
 * @returns {Promise<ImproveLetterContentOutput>} - A promise that resolves with the improved letter content and suggestions.
 */
export async function improveLetterContent(
  input: ImproveLetterContentInput
): Promise<ImproveLetterContentOutput> {
  return improveLetterContentFlow(input);
}

/**
 * Prompt definition for the improveLetterContent flow.
 * This prompt instructs the AI to analyze the letter content and provide suggestions for improvement.
 */
const improveLetterContentPrompt = ai.definePrompt({
  name: 'improveLetterContentPrompt',
  input: {schema: ImproveLetterContentInputSchema},
  output: {schema: ImproveLetterContentOutputSchema},
  prompt: `You are an AI assistant specialized in refining cover letters and motivational letters.

  Analyze the following letter content and provide an improved version, focusing on grammar, style, and overall effectiveness. Also, provide a list of specific suggestions that were applied in the improved content. Consider the target job or university and the user's background to tailor the suggestions accordingly.

  Letter Content: {{{letterContent}}}

  Target Job/University: {{{targetJobOrUniversity}}}

  User Background: {{{userBackground}}}

  Improved Content:`,
});

/**
 * Flow definition for improving letter content using AI.
 * This flow takes letter content as input and returns improved content with suggestions.
 */
const improveLetterContentFlow = ai.defineFlow(
  {
    name: 'improveLetterContentFlow',
    inputSchema: ImproveLetterContentInputSchema,
    outputSchema: ImproveLetterContentOutputSchema,
  },
  async input => {
    const {output} = await improveLetterContentPrompt(input);
    return output!;
  }
);

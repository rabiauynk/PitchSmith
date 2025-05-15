import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { saveToGoogleSheetsTool } from './googleSheets';

// Define a schema for evaluating persuasion attempts
const persuasionEvaluationSchema = z.object({
  persuasiveness: z.number().min(0).max(100).describe('Rating of how persuasive the argument was (0-100)'),
  categoryScores: z.object({
    clarity: z.number().min(0).max(20).describe('Score for clarity and structure (0-20)'),
    evidence: z.number().min(0).max(20).describe('Score for use of evidence and facts (0-20)'),
    emotional: z.number().min(0).max(20).describe('Score for emotional appeal and storytelling (0-20)'),
    objections: z.number().min(0).max(20).describe('Score for addressing potential objections (0-20)'),
    overall: z.number().min(0).max(20).describe('Score for overall persuasiveness (0-20)')
  }).describe('Breakdown of scores by category'),
  strengths: z.array(z.string()).describe('Key strengths of the persuasion attempt'),
  weaknesses: z.array(z.string()).describe('Areas where the persuasion attempt could be improved'),
  overallImpression: z.string().describe('Overall impression of the persuasion attempt'),
  convinced: z.boolean().describe('Whether the agent was convinced by the argument'),
  timeUsed: z.string().describe('How much of the 1-minute time limit was used')
});

export const evaluatePersuasionTool = createTool({
  id: 'evaluate-persuasion',
  description: 'Evaluate the persuasiveness of a user\'s argument',
  inputSchema: z.object({
    argument: z.string().describe('The persuasion attempt to evaluate'),
  }),
  outputSchema: persuasionEvaluationSchema,
  execute: async ({ context }) => {
    // This tool doesn't actually need to do anything external
    // It's just a way for the agent to structure its evaluation

    // Calculate category scores
    const clarity = evaluateClarity(context.argument);
    const evidence = evaluateEvidence(context.argument);
    const emotional = evaluateEmotionalAppeal(context.argument);
    const objections = evaluateAddressingObjections(context.argument);
    const overall = evaluateOverallPersuasiveness(context.argument);

    // Calculate total score (0-100)
    const totalScore = clarity + evidence + emotional + objections + overall;

    // Identify strengths and weaknesses
    const strengths = identifyStrengths(context.argument);
    const weaknesses = identifyWeaknesses(context.argument);
    const convinced = determineIfConvinced(totalScore);
    const timeUsed = "1 minute"; // Assuming the full time was used

    // Try to save the evaluation to Google Sheets
    try {
      // We use a fake user ID here since we don't have real user IDs
      // In a real implementation, you would use the actual user ID
      const userId = `user_${Math.floor(Math.random() * 10000)}`;
      const userName = "Anonymous User"; // Provide a default userName

      // Save to Google Sheets
      await saveToGoogleSheetsTool.execute({
        context: {
          userId,
          userName, // Add userName parameter
          argument: context.argument,
          totalScore,
          clarityScore: clarity,
          evidenceScore: evidence,
          emotionalScore: emotional,
          objectionsScore: objections,
          overallScore: overall,
          strengths,
          weaknesses,
          convinced,
          timeUsed
        }
      });

      console.log('[PERSUASION] Evaluation saved to Google Sheets');
    } catch (error) {
      // If saving to Google Sheets fails, just log the error and continue
      console.error('[PERSUASION] Error saving to Google Sheets:', error);
    }

    return {
      persuasiveness: totalScore,
      categoryScores: {
        clarity,
        evidence,
        emotional,
        objections,
        overall
      },
      strengths,
      weaknesses,
      overallImpression: generateOverallImpression(context.argument, totalScore),
      convinced,
      timeUsed
    };
  },
});

// These are placeholder functions that would normally contain more sophisticated logic
// In a real implementation, these might use more advanced NLP or other evaluation techniques

// Category evaluation functions (each returns 0-20 points)
function evaluateClarity(argument: string): number {
  // Simplified evaluation - in reality, this would be more sophisticated
  return Math.min(Math.max(Math.floor(argument.length / 50), 0), 20);
}

function evaluateEvidence(argument: string): number {
  // Check for numbers, statistics, citations, etc.
  const hasNumbers = /\d+/.test(argument);
  const hasQuotes = /"[^"]*"/.test(argument);
  const baseScore = Math.min(Math.max(Math.floor(argument.length / 60), 0), 15);
  return Math.min(baseScore + (hasNumbers ? 3 : 0) + (hasQuotes ? 2 : 0), 20);
}

function evaluateEmotionalAppeal(argument: string): number {
  // Check for emotional words, storytelling elements
  const emotionalWords = ['feel', 'believe', 'hope', 'dream', 'love', 'hate', 'fear', 'joy'];
  const emotionalWordCount = emotionalWords.filter(word => argument.toLowerCase().includes(word)).length;
  return Math.min(Math.max(Math.floor(argument.length / 70) + emotionalWordCount * 2, 0), 20);
}

function evaluateAddressingObjections(argument: string): number {
  // Check for phrases that address counterarguments
  const objectionPhrases = ['however', 'but', 'on the other hand', 'critics might say', 'you might think'];
  const objectionCount = objectionPhrases.filter(phrase => argument.toLowerCase().includes(phrase)).length;
  return Math.min(Math.max(Math.floor(argument.length / 80) + objectionCount * 3, 0), 20);
}

function evaluateOverallPersuasiveness(argument: string): number {
  // Overall persuasiveness based on length and structure
  return Math.min(Math.max(Math.floor(argument.length / 40), 0), 20);
}

function identifyStrengths(argument: string): string[] {
  // More detailed strength identification
  const strengths = [];

  if (argument.length > 200) strengths.push('Detailed argument');
  if (/\d+/.test(argument)) strengths.push('Uses numerical evidence');
  if (/"[^"]*"/.test(argument)) strengths.push('Includes quotations or citations');
  if (/\?/.test(argument)) strengths.push('Engages the listener with questions');
  if (/I|we|you/.test(argument)) strengths.push('Personal connection with audience');

  // Return default strengths if none were identified
  return strengths.length > 0 ? strengths : ['Attempted to make a persuasive case'];
}

function identifyWeaknesses(argument: string): string[] {
  // More detailed weakness identification
  const weaknesses = [];

  if (argument.length < 200) weaknesses.push('Could provide more detail');
  if (!(/\d+/.test(argument))) weaknesses.push('Could include more concrete evidence');
  if (!(/"[^"]*"/.test(argument))) weaknesses.push('Could include citations or expert opinions');
  if (!(/however|but|on the other hand/.test(argument.toLowerCase())))
    weaknesses.push('Could address potential counterarguments');

  // Return default weaknesses if none were identified
  return weaknesses.length > 0 ? weaknesses : ['Could improve overall persuasiveness'];
}

function generateOverallImpression(argument: string, score: number): string {
  // Generate impression based on total score
  if (score >= 90) {
    return 'An exceptionally persuasive argument that effectively combines logical reasoning, evidence, and emotional appeal.';
  } else if (score >= 80) {
    return 'A highly persuasive argument that successfully addresses most aspects of effective persuasion.';
  } else if (score >= 70) {
    return 'A strong argument with several persuasive elements, though there is room for improvement.';
  } else if (score >= 60) {
    return 'A reasonably persuasive argument that makes some good points but lacks in certain areas.';
  } else if (score >= 50) {
    return 'A moderately persuasive argument with both strengths and significant weaknesses.';
  } else if (score >= 40) {
    return 'An argument with some persuasive elements but substantial room for improvement.';
  } else if (score >= 30) {
    return 'A weak argument that fails to persuade in most aspects.';
  } else {
    return 'An ineffective argument that needs significant improvement in all areas of persuasion.';
  }
}

function determineIfConvinced(score: number): boolean {
  // Determine if the agent is convinced based on the total score
  return score >= 75; // Convinced if score is 75 or higher
}

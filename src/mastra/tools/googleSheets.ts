import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { googleSheetsService, PersuasionEvaluationData } from '../services/googleSheetsService';

export const saveToGoogleSheetsTool = createTool({
  id: 'save-to-google-sheets',
  description: 'Save persuasion evaluation data to Google Sheets',
  inputSchema: z.object({
    userId: z.string().describe('User ID or chat ID'),
    userName: z.string().optional().describe('User name (optional)'),
    argument: z.string().describe('The persuasion argument text'),
    totalScore: z.number().min(0).max(100).describe('Total persuasiveness score (0-100)'),
    clarityScore: z.number().min(0).max(20).describe('Clarity score (0-20)'),
    evidenceScore: z.number().min(0).max(20).describe('Evidence score (0-20)'),
    emotionalScore: z.number().min(0).max(20).describe('Emotional appeal score (0-20)'),
    objectionsScore: z.number().min(0).max(20).describe('Addressing objections score (0-20)'),
    overallScore: z.number().min(0).max(20).describe('Overall persuasiveness score (0-20)'),
    strengths: z.array(z.string()).describe('Key strengths of the persuasion attempt'),
    weaknesses: z.array(z.string()).describe('Areas where the persuasion attempt could be improved'),
    convinced: z.boolean().describe('Whether the agent was convinced by the argument'),
    timeUsed: z.string().describe('How much of the 1-minute time limit was used')
  }),
  outputSchema: z.object({
    success: z.boolean().describe('Whether the data was successfully saved'),
    message: z.string().describe('Status message'),
    spreadsheetUrl: z.string().optional().describe('URL to the Google Spreadsheet')
  }),
  execute: async ({ context }) => {
    console.log('[GOOGLE SHEETS TOOL] Saving persuasion evaluation data to Google Sheets');
    
    try {
      // Format the data for the Google Sheets service
      const evaluationData: PersuasionEvaluationData = {
        timestamp: new Date().toISOString(),
        userId: context.userId,
        userName: context.userName,
        argument: context.argument,
        totalScore: context.totalScore,
        clarityScore: context.clarityScore,
        evidenceScore: context.evidenceScore,
        emotionalScore: context.emotionalScore,
        objectionsScore: context.objectionsScore,
        overallScore: context.overallScore,
        strengths: context.strengths.join(', '),
        weaknesses: context.weaknesses.join(', '),
        convinced: context.convinced,
        timeUsed: context.timeUsed
      };
      
      // Save the data to Google Sheets
      const success = await googleSheetsService.saveEvaluationData(evaluationData);
      
      if (success) {
        return {
          success: true,
          message: 'Persuasion evaluation data saved to Google Sheets successfully',
          spreadsheetUrl: googleSheetsService.getSpreadsheetUrl()
        };
      } else {
        // If saving fails, return a failure response but don't throw an error
        // This allows the agent to continue functioning even if Google Sheets integration fails
        return {
          success: false,
          message: 'Failed to save persuasion evaluation data to Google Sheets'
        };
      }
    } catch (error) {
      console.error('[GOOGLE SHEETS TOOL] Error:', error);
      
      // Return a failure response but don't throw an error
      return {
        success: false,
        message: `Error saving to Google Sheets: ${error.message || 'Unknown error'}`
      };
    }
  }
});

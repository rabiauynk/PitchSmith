
import * as fs from 'fs';
import { google, sheets_v4 } from 'googleapis';
import * as path from 'path';

// Spreadsheet ID - Kullanıcının verdiği ID
const SPREADSHEET_ID = '1MOCWINetPpH2bYNvqZXk_Wi8MKtxu-zZ1hOjbaiIWQ4';
const SHEET_NAME = 'PersuasionScores';

// Interface for persuasion evaluation data
export interface PersuasionEvaluationData {
  timestamp: string;
  userId: string;
  userName?: string;
  argument: string;
  totalScore: number;
  clarityScore: number;
  evidenceScore: number;
  emotionalScore: number;
  objectionsScore: number;
  overallScore: number;
  strengths: string;
  weaknesses: string;
  convinced: boolean;
  timeUsed: string;
}

// Class to handle Google Sheets operations
export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets | null = null;
  private initialized: boolean = false;
  private evaluations: PersuasionEvaluationData[] = [];
  private filePath: string;

  constructor() {
    // Yerel dosya yolu oluştur
    this.filePath = path.resolve(process.cwd(), 'evaluations.json');

    try {
      // Yerel dosya varsa oku
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        this.evaluations = JSON.parse(fileContent);
      } else {
        // Dosya yoksa boş bir dizi oluştur
        this.evaluations = [];
        fs.writeFileSync(this.filePath, JSON.stringify(this.evaluations, null, 2), 'utf8');
      }

      // Google Sheets API'sini başlat
      this.initializeGoogleSheets();

    } catch (error) {
      console.error('[GOOGLE SHEETS] Error initializing service:', error);
      this.initialized = false;
    }
  }

  /**
   * Initialize Google Sheets API
   */
  private async initializeGoogleSheets() {
    try {
      // Servis hesabı kimlik bilgileri için tip tanımı
      let credentials: {
        client_email: string;
        private_key: string;
        [key: string]: any;
      };
      // Servis hesabı kimlik bilgilerini dosyadan yükle
      try {
        // service-account.json dosyasını okumaya çalış
        const credentialsPath = path.resolve(process.cwd(), 'service-account.json');
        const credentialsFile = fs.readFileSync(credentialsPath, 'utf8');
        credentials = JSON.parse(credentialsFile);

        // Servis hesabı kimlik bilgileri başarıyla yüklendi
        console.log('[GOOGLE SHEETS] Service account credentials loaded successfully');
      } catch (error) {
        console.error('[GOOGLE SHEETS] Error loading service account credentials:', error);
        console.log('[GOOGLE SHEETS] Using local storage only');
        this.initialized = false;
        return;
      }

      // Servis hesabı kimlik bilgileri ile Google Sheets istemcisi oluştur
      const auth = new google.auth.JWT(
        credentials.client_email,
        undefined,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      this.sheets = google.sheets({ version: 'v4', auth });

      this.initialized = true;
      console.log('[GOOGLE SHEETS] Service initialized successfully');

      // Spreadsheet'i başlat
      await this.initializeSpreadsheet();

    } catch (error) {
      console.error('[GOOGLE SHEETS] Error initializing Google Sheets API:', error);
      this.initialized = false;
    }
  }

  /**
   * Initialize the spreadsheet with headers if it doesn't exist
   */
  async initializeSpreadsheet(): Promise<boolean> {
    if (!this.initialized || !this.sheets) {
      console.error('[GOOGLE SHEETS] Service not initialized');
      return false;
    }

    try {
      // Check if the sheet exists
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      // Find if our sheet exists
      const sheet = response.data.sheets?.find(
        (s) => s.properties?.title === SHEET_NAME
      );

      if (!sheet) {
        // Create the sheet if it doesn't exist
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: SHEET_NAME,
                  },
                },
              },
            ],
          },
        });

        // Add headers
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A1:N1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [
              [
                'Timestamp',
                'User ID',
                'User Name',
                'Argument',
                'Total Score',
                'Clarity Score',
                'Evidence Score',
                'Emotional Score',
                'Objections Score',
                'Overall Score',
                'Strengths',
                'Weaknesses',
                'Convinced',
                'Time Used',
              ],
            ],
          },
        });
      }

      console.log('[GOOGLE SHEETS] Spreadsheet initialized successfully');
      return true;
    } catch (error) {
      console.error('[GOOGLE SHEETS] Error initializing spreadsheet:', error);
      return false;
    }
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Save persuasion evaluation data
   */
  async saveEvaluationData(data: PersuasionEvaluationData): Promise<boolean> {
    // Sadece yerel dosyaya kaydet
    try {
      this.evaluations.push(data);
      fs.writeFileSync(this.filePath, JSON.stringify(this.evaluations, null, 2), 'utf8');
      console.log('[GOOGLE SHEETS] Evaluation data saved to local file');

      // Başarılı olarak işaretle
      return true;
    } catch (error) {
      console.error('[GOOGLE SHEETS] Error saving to local file:', error);
      return false;
    }
  }

  /**
   * Get the spreadsheet URL
   */
  getSpreadsheetUrl(): string {
    return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
  }
}

// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();

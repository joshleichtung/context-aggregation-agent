import axios from 'axios';
import { SourceType } from '../models';

interface ACIResponse {
  data: any;
  error?: string;
}

class ACIService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.ACI_BASE_URL || 'https://api.aci.dev';
    this.apiKey = process.env.ACI_API_KEY || '';
  }

  async collectFromSlack(channelId: string, limit: number = 100): Promise<any[]> {
    // TODO: Implement actual ACI.dev Slack integration
    // For now, this is a placeholder that would call ACI.dev's SLACK__GET_MESSAGES function

    try {
      const response = await axios.post<ACIResponse>(
        `${this.baseUrl}/tools/slack/messages`,
        {
          channel: channelId,
          limit,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching Slack messages:', error);
      // Return mock data for development
      return [
        {
          id: 'msg-1',
          text: 'Sample Slack message 1',
          user: 'user1',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          text: 'Sample Slack message 2',
          user: 'user2',
          timestamp: new Date().toISOString(),
        },
      ];
    }
  }

  async collectFromGoogleDoc(documentId: string): Promise<any> {
    // TODO: Implement actual ACI.dev Google Docs integration
    // For now, this is a placeholder that would call ACI.dev's GOOGLE_DOC__GET_DOCUMENT function

    try {
      const response = await axios.post<ACIResponse>(
        `${this.baseUrl}/tools/google-docs/document`,
        {
          documentId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching Google Doc:', error);
      // Return mock data for development
      return {
        id: documentId,
        title: 'Sample Google Doc',
        content: 'This is a sample Google Doc content.',
        author: 'doc-author',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async collectFromWeb(url: string): Promise<any> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Context-Aggregation-Agent/1.0',
        },
        timeout: 10000,
      });

      // Simple HTML content extraction
      // In production, use a proper HTML parser
      const content = response.data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      return {
        url,
        content: content.substring(0, 10000), // Limit content length
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching web page:', error);
      // Return mock data for development
      return {
        url,
        content: 'Sample web page content.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async collectContext(sourceType: SourceType, sourceId: string): Promise<any> {
    switch (sourceType) {
      case 'slack':
        return this.collectFromSlack(sourceId);
      case 'google_doc':
        return this.collectFromGoogleDoc(sourceId);
      case 'web':
        return this.collectFromWeb(sourceId);
      default:
        throw new Error(`Unsupported source type: ${sourceType}`);
    }
  }
}

export const aciService = new ACIService();

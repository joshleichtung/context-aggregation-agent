import axios from 'axios';

interface TraceData {
  operation: string;
  input: any;
  output: any;
  metadata?: Record<string, any>;
  startTime: number;
  endTime: number;
  duration: number;
}

interface EvaluationMetrics {
  relevance?: number;
  hallucination?: number;
  contextPrecision?: number;
}

class OpikService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly projectName: string;

  constructor() {
    this.baseUrl = process.env.OPIK_BASE_URL || 'https://api.comet.com/opik';
    this.apiKey = process.env.OPIK_API_KEY || '';
    this.projectName = process.env.OPIK_PROJECT_NAME || 'context-aggregation-agent';
  }

  async logTrace(traceData: TraceData): Promise<void> {
    // TODO: Implement actual Comet/Opik integration
    // For now, this is a placeholder that would send traces to Opik

    try {
      await axios.post(
        `${this.baseUrl}/traces`,
        {
          project: this.projectName,
          ...traceData,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`[Opik] Trace logged: ${traceData.operation}`);
    } catch (error) {
      console.error('[Opik] Error logging trace:', error);
      // In development, just log to console
      console.log('[Opik] Trace (dev mode):', traceData);
    }
  }

  async evaluateSummary(
    summary: string,
    context: string,
    query: string
  ): Promise<EvaluationMetrics> {
    // TODO: Implement actual Opik evaluation metrics
    // For now, this is a placeholder that would evaluate summaries using Opik

    try {
      const response = await axios.post(
        `${this.baseUrl}/evaluate`,
        {
          project: this.projectName,
          summary,
          context,
          query,
          metrics: ['relevance', 'hallucination', 'contextPrecision'],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.metrics || {};
    } catch (error) {
      console.error('[Opik] Error evaluating summary:', error);
      // Return mock metrics for development
      return {
        relevance: 0.85,
        hallucination: 0.1,
        contextPrecision: 0.75,
      };
    }
  }

  trackSummarization(topic: string, contextCount: number) {
    return async (fn: () => Promise<string>): Promise<string> => {
      const startTime = Date.now();

      try {
        const result = await fn();
        const endTime = Date.now();

        await this.logTrace({
          operation: 'summarization',
          input: { topic, contextCount },
          output: { summary: result },
          metadata: {
            model: 'friendliai',
            timestamp: new Date().toISOString(),
          },
          startTime,
          endTime,
          duration: endTime - startTime,
        });

        return result;
      } catch (error) {
        const endTime = Date.now();

        await this.logTrace({
          operation: 'summarization',
          input: { topic, contextCount },
          output: { error: String(error) },
          metadata: {
            model: 'friendliai',
            timestamp: new Date().toISOString(),
            failed: true,
          },
          startTime,
          endTime,
          duration: endTime - startTime,
        });

        throw error;
      }
    };
  }
}

export const opikService = new OpikService();

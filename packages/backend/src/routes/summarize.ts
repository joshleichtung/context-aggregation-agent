import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { weaviateService, friendliAIService, opikService } from '../services';
import { SummarySchema } from '../models';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { topic, query, tags, limit = 10 } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: 'Missing required field: topic',
      });
    }

    // Search for relevant context items
    const searchQuery = query || topic;
    const contextItems = await weaviateService.searchContextItems(
      searchQuery,
      limit,
      tags
    );

    if (contextItems.length === 0) {
      return res.status(404).json({
        error: 'No context items found for the given query',
      });
    }

    // Concatenate context for summarization
    const concatenatedContext = contextItems
      .map((item) => item.content)
      .join('\n\n---\n\n');

    // Generate summary with tracking
    const tracker = opikService.trackSummarization(topic, contextItems.length);
    const summaryText = await tracker(() =>
      friendliAIService.generateSummary(concatenatedContext, topic)
    );

    // Evaluate the summary
    const metrics = await opikService.evaluateSummary(
      summaryText,
      concatenatedContext,
      searchQuery
    );

    // Create summary object
    const summary = {
      id: uuidv4(),
      topic,
      summaryText,
      relatedContextIds: contextItems.map((item) => item.id),
      createdAt: new Date().toISOString(),
    };

    // Validate and store summary
    const validated = SummarySchema.parse(summary);
    await weaviateService.upsertSummary(validated);

    res.json({
      success: true,
      summary: validated,
      metrics,
      contextCount: contextItems.length,
    });
  } catch (error) {
    console.error('Error in /summarize endpoint:', error);
    res.status(500).json({
      error: 'Failed to generate summary',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await weaviateService.getSummaryById(id);

    if (!summary) {
      return res.status(404).json({
        error: 'Summary not found',
      });
    }

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Error in /summarize/:id endpoint:', error);
    res.status(500).json({
      error: 'Failed to retrieve summary',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;

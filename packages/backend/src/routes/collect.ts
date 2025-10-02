import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ContextItemSchema } from '../models';
import { aciService, weaviateService } from '../services';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { sourceType, sourceId, tags = [] } = req.body;

    if (!sourceType || !sourceId) {
      return res.status(400).json({
        error: 'Missing required fields: sourceType and sourceId',
      });
    }

    // Collect context from source using ACI.dev
    const rawData = await aciService.collectContext(sourceType, sourceId);

    // Process and store context items
    const contextItems: any[] = Array.isArray(rawData) ? rawData : [rawData];

    const storedItems = [];

    for (const item of contextItems) {
      const contextItem = {
        id: uuidv4(),
        sourceType,
        sourceId,
        content: item.text || item.content || '',
        metadata: {
          author: item.user || item.author || '',
          timestamp: item.timestamp || new Date().toISOString(),
          title: item.title || '',
        },
        tags,
      };

      // Validate with Zod
      const validated = ContextItemSchema.parse(contextItem);

      // Store in Weaviate
      await weaviateService.upsertContextItem(validated);

      storedItems.push(validated);
    }

    res.json({
      success: true,
      message: `Collected and stored ${storedItems.length} context items`,
      items: storedItems,
    });
  } catch (error) {
    console.error('Error in /collect endpoint:', error);
    res.status(500).json({
      error: 'Failed to collect context',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;

import { Router } from 'express';
import { weaviateService } from '../services';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { query, limit = '10', tags } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Missing required query parameter',
      });
    }

    const limitNum = parseInt(limit as string, 10);
    const tagArray = tags ? (typeof tags === 'string' ? [tags] : tags as string[]) : undefined;

    const results = await weaviateService.searchContextItems(
      query,
      limitNum,
      tagArray
    );

    res.json({
      success: true,
      query,
      limit: limitNum,
      tags: tagArray,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error in /search endpoint:', error);
    res.status(500).json({
      error: 'Failed to search context',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;

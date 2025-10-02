import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import collectRouter from './routes/collect';
import searchRouter from './routes/search';
import summarizeRouter from './routes/summarize';
import { weaviateService } from './services';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/collect', collectRouter);
app.use('/api/search', searchRouter);
app.use('/api/summarize', summarizeRouter);

async function startServer() {
  try {
    // Initialize Weaviate connection
    await weaviateService.initialize();
    console.log('✓ Weaviate initialized');

    app.listen(PORT, () => {
      console.log(`✓ Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

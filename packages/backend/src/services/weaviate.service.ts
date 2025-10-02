import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import { ContextItem, Summary } from '../models';

class WeaviateService {
  private client: WeaviateClient | null = null;
  private readonly CONTEXT_COLLECTION = 'ContextItem';
  private readonly SUMMARY_COLLECTION = 'Summary';

  async initialize(): Promise<void> {
    const scheme = process.env.WEAVIATE_SCHEME || 'http';
    const host = process.env.WEAVIATE_HOST || 'localhost:8080';
    const apiKey = process.env.WEAVIATE_API_KEY;

    const clientConfig: any = {
      scheme,
      host,
    };

    if (apiKey) {
      clientConfig.apiKey = new ApiKey(apiKey);
    }

    this.client = weaviate.client(clientConfig);

    await this.createSchemaIfNotExists();
  }

  private async createSchemaIfNotExists(): Promise<void> {
    if (!this.client) throw new Error('Weaviate client not initialized');

    try {
      // Check if ContextItem collection exists
      const contextExists = await this.client.schema
        .getter()
        .do()
        .then((schema) =>
          schema.classes?.some((c) => c.class === this.CONTEXT_COLLECTION)
        );

      if (!contextExists) {
        await this.client.schema
          .classCreator()
          .withClass({
            class: this.CONTEXT_COLLECTION,
            description: 'Context items from various sources',
            vectorizer: 'text2vec-weaviate',
            moduleConfig: {
              'text2vec-weaviate': {
                model: 'ada',
                modelVersion: '002',
                type: 'text',
              },
            },
            properties: [
              {
                name: 'sourceType',
                dataType: ['text'],
                description: 'Type of source: slack, google_doc, or web',
              },
              {
                name: 'sourceId',
                dataType: ['text'],
                description: 'Identifier of the source',
              },
              {
                name: 'content',
                dataType: ['text'],
                description: 'Raw text content',
              },
              {
                name: 'author',
                dataType: ['text'],
                description: 'Author of the content',
              },
              {
                name: 'timestamp',
                dataType: ['text'],
                description: 'Timestamp of the content',
              },
              {
                name: 'title',
                dataType: ['text'],
                description: 'Title of the content',
              },
              {
                name: 'tags',
                dataType: ['text[]'],
                description: 'Tags associated with the context',
              },
            ],
          })
          .do();
      }

      // Check if Summary collection exists
      const summaryExists = await this.client.schema
        .getter()
        .do()
        .then((schema) =>
          schema.classes?.some((c) => c.class === this.SUMMARY_COLLECTION)
        );

      if (!summaryExists) {
        await this.client.schema
          .classCreator()
          .withClass({
            class: this.SUMMARY_COLLECTION,
            description: 'Generated summaries',
            vectorizer: 'text2vec-weaviate',
            moduleConfig: {
              'text2vec-weaviate': {
                model: 'ada',
                modelVersion: '002',
                type: 'text',
              },
            },
            properties: [
              {
                name: 'topic',
                dataType: ['text'],
                description: 'Topic of the summary',
              },
              {
                name: 'summaryText',
                dataType: ['text'],
                description: 'Summary text',
              },
              {
                name: 'relatedContextIds',
                dataType: ['text[]'],
                description: 'IDs of related context items',
              },
              {
                name: 'createdAt',
                dataType: ['text'],
                description: 'Creation timestamp',
              },
            ],
          })
          .do();
      }
    } catch (error) {
      console.error('Error creating Weaviate schema:', error);
      throw error;
    }
  }

  async upsertContextItem(item: ContextItem): Promise<void> {
    if (!this.client) throw new Error('Weaviate client not initialized');

    await this.client.data
      .creator()
      .withClassName(this.CONTEXT_COLLECTION)
      .withId(item.id)
      .withProperties({
        sourceType: item.sourceType,
        sourceId: item.sourceId,
        content: item.content,
        author: item.metadata.author || '',
        timestamp: item.metadata.timestamp || '',
        title: item.metadata.title || '',
        tags: item.tags,
      })
      .do();
  }

  async searchContextItems(
    query: string,
    limit: number = 10,
    tags?: string[]
  ): Promise<ContextItem[]> {
    if (!this.client) throw new Error('Weaviate client not initialized');

    let queryBuilder = this.client.graphql
      .get()
      .withClassName(this.CONTEXT_COLLECTION)
      .withFields('_additional { id } sourceType sourceId content author timestamp title tags')
      .withNearText({ concepts: [query] })
      .withLimit(limit);

    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.withWhere({
        operator: 'ContainsAny',
        path: ['tags'],
        valueTextArray: tags,
      });
    }

    const result = await queryBuilder.do();

    const items = result.data.Get[this.CONTEXT_COLLECTION] || [];

    return items.map((item: any) => ({
      id: item._additional.id,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      content: item.content,
      metadata: {
        author: item.author,
        timestamp: item.timestamp,
        title: item.title,
      },
      tags: item.tags || [],
    }));
  }

  async upsertSummary(summary: Summary): Promise<void> {
    if (!this.client) throw new Error('Weaviate client not initialized');

    await this.client.data
      .creator()
      .withClassName(this.SUMMARY_COLLECTION)
      .withId(summary.id)
      .withProperties({
        topic: summary.topic,
        summaryText: summary.summaryText,
        relatedContextIds: summary.relatedContextIds,
        createdAt: summary.createdAt || new Date().toISOString(),
      })
      .do();
  }

  async getSummaryById(id: string): Promise<Summary | null> {
    if (!this.client) throw new Error('Weaviate client not initialized');

    try {
      const result = await this.client.data
        .getterById()
        .withClassName(this.SUMMARY_COLLECTION)
        .withId(id)
        .do();

      if (!result) return null;

      return {
        id: result.id,
        topic: result.properties.topic,
        summaryText: result.properties.summaryText,
        relatedContextIds: result.properties.relatedContextIds,
        createdAt: result.properties.createdAt,
      };
    } catch (error) {
      console.error('Error fetching summary:', error);
      return null;
    }
  }
}

export const weaviateService = new WeaviateService();

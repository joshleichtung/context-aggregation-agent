'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type SourceType = 'slack' | 'google_doc' | 'web';

export function ContextCollector() {
  const [sourceType, setSourceType] = useState<SourceType>('slack');
  const [sourceId, setSourceId] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/collect`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceType,
            sourceId,
            tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success: ${data.message}`);
        setSourceId('');
        setTags('');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collect Context</CardTitle>
        <CardDescription>
          Gather context from Slack, Google Docs, or web pages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceType">Source Type</Label>
            <select
              id="sourceType"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as SourceType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="slack">Slack</option>
              <option value="google_doc">Google Doc</option>
              <option value="web">Web URL</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceId">
              {sourceType === 'slack' && 'Channel ID'}
              {sourceType === 'google_doc' && 'Document ID'}
              {sourceType === 'web' && 'URL'}
            </Label>
            <Input
              id="sourceId"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              placeholder={
                sourceType === 'slack'
                  ? 'C1234567890'
                  : sourceType === 'google_doc'
                  ? 'doc-id'
                  : 'https://example.com'
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="project-x, Q1-planning"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Collecting...' : 'Collect Context'}
          </Button>

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.startsWith('Success')
                  ? 'bg-green-50 text-green-900'
                  : 'bg-red-50 text-red-900'
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

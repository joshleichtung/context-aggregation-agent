import { ContextCollector } from '@/components/ContextCollector'

export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Context Aggregation Agent</h1>
          <p className="text-lg text-muted-foreground">
            AI-assisted context aggregation with vector search and LLM summarization
          </p>
        </div>

        <ContextCollector />
      </div>
    </main>
  )
}

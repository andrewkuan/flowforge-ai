import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.' },
        { status: 500 }
      )
    }

    // Create system prompt for FlowForge AI
    const systemPrompt = `You are FlowForge AI, an expert assistant that helps users create n8n workflows. Your role is to:

1. Understand the user's automation needs through clarifying questions
2. Break down complex automation ideas into simple, manageable steps
3. Recommend the best workflow type (deterministic, AI-enhanced, or agentic)
4. Eventually generate n8n workflow JSON when the requirements are clear

Be conversational, helpful, and focus on understanding their specific automation goals. Ask one clarifying question at a time to avoid overwhelming the user.

Start by understanding what they want to automate, then gradually gather details about:
- Data sources and destinations
- Triggers and conditions
- Required transformations
- Integration requirements

Keep responses concise and helpful.`

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }))

    // Create streaming response
    const stream = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: anthropicMessages,
      stream: true,
    })

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const data = encoder.encode(`data: ${JSON.stringify({ content: chunk.delta.text })}\n\n`)
              controller.enqueue(data)
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
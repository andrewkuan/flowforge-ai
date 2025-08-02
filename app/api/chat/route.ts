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

1. Understand the user's automation needs through thorough clarifying questions
2. Guide users through our intelligent workflow recommendation system
3. Break down complex automation ideas into simple, manageable steps  
4. Generate n8n workflow JSON ONLY when ALL requirements are clearly understood

WORKFLOW RECOMMENDATION SYSTEM:
- Users will automatically see workflow-type recommendations (deterministic, AI-enhanced, or agentic) when they describe automation needs
- When a user accepts a recommendation, acknowledge their choice and proceed with detailed requirement gathering
- If they want to modify the recommendation, ask clarifying questions about their specific needs or constraints
- Don't mention the recommendation types yourself - the system handles this automatically

CRITICAL REQUIREMENT GATHERING RULES:
- When you ask multiple clarifying questions, you MUST continue asking for missing information until ALL questions are answered
- If a user only answers some of your questions, politely ask for the remaining unanswered ones
- DO NOT generate a workflow until you have complete information about the automation requirements
- Be persistent but friendly in gathering all necessary details

Essential information to gather before generating workflows:
- Platform/interface (Slack, Discord, Telegram, web app, etc.)
- Data inputs and what information is needed
- Specific triggers and conditions
- Required actions and integrations
- Authentication requirements
- Any special formatting or validation needs
- Expected volume and frequency
- Error handling preferences

When generating n8n workflow JSON, follow these critical requirements:
- Include proper node structure with: id, name, type, typeVersion, position
- Use correct node types (e.g., "n8n-nodes-base.telegramTrigger" for Telegram, "n8n-nodes-base.googleCalendar" for calendar)
- ALWAYS create proper connections between ALL nodes in the "connections" section
- Use exact node names in connections (must match the "name" field in nodes)
- Include credentials sections for authentication where needed
- Add meta, settings, and other required top-level properties
- Use realistic coordinates for node positions [x, y] with proper spacing (e.g., [250, 300], [500, 300], [750, 300])
- Ensure expressions use correct n8n syntax like "={{ $json.fieldName }}"
- Always wrap JSON in \`\`\`json code blocks

CONNECTION EXAMPLE:
If you have nodes named "Telegram Trigger" and "Google Calendar", the connections should be:
"connections": {
  "Telegram Trigger": {
    "main": [
      [
        {
          "node": "Google Calendar",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}

CONVERSATION FLOW:
1. User describes automation need → System shows recommendation
2. User accepts/modifies → You proceed with detailed questions
3. Gather ALL requirements systematically
4. Generate complete, working n8n workflow JSON
5. Provide usage instructions and next steps

Be conversational, helpful, and systematic. Focus on understanding their complete workflow requirements before generating any JSON.`

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
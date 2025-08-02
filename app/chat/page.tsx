'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiContent = ''

      // Add empty AI message that we'll update as we stream
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                setIsLoading(false)
                return
              }
              
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  aiContent += parsed.content
                  setMessages(prev => {
                    const newMessages = [...prev]
                    if (newMessages[newMessages.length - 1].role === 'assistant') {
                      newMessages[newMessages.length - 1].content = aiContent
                    }
                    return newMessages
                  })
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please make sure your Anthropic API key is configured in .env.local and try again.' 
      }])
    }
    
    setIsLoading(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 2rem',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/">
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: 'black',
            margin: 0,
            cursor: 'pointer'
          }}>
            FlowForge AI
          </h1>
        </Link>
        <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
          n8n Workflow Assistant
        </p>
      </div>

      {/* Chat Area */}
      <div style={{ 
        flex: 1, 
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2 style={{ color: 'black', marginBottom: '1rem' }}>
              Let's create your n8n workflow
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Describe your automation idea and I'll help you build it step by step.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '2rem' }}>
            {messages.map((message, index) => (
              <div key={index} style={{
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: message.role === 'user' ? 'black' : '#f5f5f5',
                  color: message.role === 'user' ? 'white' : 'black'
                }}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '1rem 2rem',
        borderTop: '1px solid #e5e5e5',
        backgroundColor: 'white'
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Describe your automation idea..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              backgroundColor: input.trim() ? 'black' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: input.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
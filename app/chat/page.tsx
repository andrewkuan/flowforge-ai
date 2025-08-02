'use client'

import { useState } from 'react'
import Link from 'next/link'

// Component to format AI messages with better structure
function FormattedMessage({ content }: { content: string }) {
  
  // Function to extract and download JSON from message content
  const extractAndDownloadJSON = (text: string) => {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      const jsonContent = jsonMatch[1].trim()
      try {
        // Validate JSON
        JSON.parse(jsonContent)
        
        // Create download
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'n8n-workflow.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        alert('Invalid JSON format')
      }
    }
  }

  // Split content into paragraphs and format numbered lists
  const formatContent = (text: string) => {
    const elements: JSX.Element[] = []
    
    // Check if there's JSON content
    const hasJSON = text.includes('```json')
    
    // Split by code blocks first
    const parts = text.split(/(```json[\s\S]*?```)/g)
    
    parts.forEach((part, partIndex) => {
      if (part.startsWith('```json')) {
        // This is a JSON code block
        const jsonContent = part.replace(/```json\s*/, '').replace(/\s*```$/, '').trim()
        elements.push(
          <div key={`json-${partIndex}`} style={{ 
            marginBottom: '1rem',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#f6f8fa',
              padding: '0.5rem 1rem',
              borderBottom: '1px solid #e1e5e9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.85rem', color: '#656d76', fontWeight: '500' }}>
                n8n Workflow JSON
              </span>
              <button
                onClick={() => extractAndDownloadJSON(part)}
                style={{
                  backgroundColor: '#1a73e8',
                  color: 'white',
                  border: 'none',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                📥 Download
              </button>
            </div>
            <pre style={{
              margin: 0,
              padding: '1rem',
              backgroundColor: '#f6f8fa',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              <code>{jsonContent}</code>
            </pre>
          </div>
        )
      } else {
        // Regular text content
        const lines = part.split('\n').filter(line => line.trim() !== '')
        
        lines.forEach((line, index) => {
          const trimmedLine = line.trim()
          if (!trimmedLine) return
          
          // Check if it's a numbered list item
          if (/^\d+\./.test(trimmedLine)) {
            elements.push(
              <div key={`${partIndex}-${index}`} style={{ 
                marginBottom: '0.5rem',
                paddingLeft: '1rem'
              }}>
                <strong style={{ color: '#1a73e8' }}>
                  {trimmedLine.split('.')[0]}.
                </strong>
                <span style={{ marginLeft: '0.5rem' }}>
                  {trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim()}
                </span>
              </div>
            )
          }
          // Check if it's a bullet point
          else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
            elements.push(
              <div key={`${partIndex}-${index}`} style={{ 
                marginBottom: '0.4rem',
                paddingLeft: '1rem',
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <span style={{ 
                  color: '#1a73e8', 
                  marginRight: '0.5rem',
                  fontWeight: 'bold'
                }}>•</span>
                <span>{trimmedLine.substring(2).trim()}</span>
              </div>
            )
          }
          // Regular paragraph
          else {
            elements.push(
              <p key={`${partIndex}-${index}`} style={{ 
                marginBottom: '0.8rem',
                lineHeight: '1.5',
                color: '#2c3e50'
              }}>
                {trimmedLine}
              </p>
            )
          }
        })
      }
    })
    
    return elements
  }

  return (
    <div style={{ lineHeight: '1.6' }}>
      {formatContent(content)}
    </div>
  )
}

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
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: message.role === 'user' ? '0.75rem 1rem' : '1rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: message.role === 'user' ? 'black' : '#f8f9fa',
                  color: message.role === 'user' ? 'white' : '#2c3e50',
                  border: message.role === 'assistant' ? '1px solid #e9ecef' : 'none',
                  boxShadow: message.role === 'assistant' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}>
                  {message.role === 'assistant' ? (
                    <FormattedMessage content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-start',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#1a73e8',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></div>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#1a73e8',
                    animation: 'pulse 1.5s ease-in-out infinite 0.3s'
                  }}></div>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#1a73e8',
                    animation: 'pulse 1.5s ease-in-out infinite 0.6s'
                  }}></div>
                  <span style={{ 
                    marginLeft: '0.5rem',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    FlowForge AI is thinking...
                  </span>
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
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { StorageService } from '@/lib/storage'
import { ChatMessage as StoredChatMessage } from '@/lib/database'
import SessionHistory from '@/components/SessionHistory'
import WorkflowRecommendationComponent from '@/components/WorkflowRecommendation'
import MermaidDiagram from '@/components/MermaidDiagram'
import { WorkflowAnalyzer, WorkflowRecommendation, WorkflowType } from '@/lib/workflow-analyzer'

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

  // Function to copy JSON to clipboard
  const copyJSONToClipboard = (text: string) => {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      const jsonContent = jsonMatch[1].trim()
      try {
        // Validate JSON
        JSON.parse(jsonContent)
        
        // Copy to clipboard
        navigator.clipboard.writeText(jsonContent).then(() => {
          // Visual feedback - could be enhanced with a toast notification
          alert('JSON workflow copied to clipboard!')
        }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = jsonContent
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          alert('JSON workflow copied to clipboard!')
        })
      } catch (e) {
        alert('Invalid JSON format')
      }
    }
  }

  // Function to extract and download Mermaid diagram
  const extractAndDownloadMermaid = (text: string) => {
    const mermaidMatch = text.match(/```mermaid\s*([\s\S]*?)\s*```/)
    if (mermaidMatch) {
      const mermaidContent = mermaidMatch[1].trim()
      
      // Create download
      const blob = new Blob([mermaidContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'process-flowchart.mmd'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  // Function to copy Mermaid to clipboard
  const copyMermaidToClipboard = (text: string) => {
    const mermaidMatch = text.match(/```mermaid\s*([\s\S]*?)\s*```/)
    if (mermaidMatch) {
      const mermaidContent = mermaidMatch[1].trim()
      
      // Copy to clipboard
      navigator.clipboard.writeText(mermaidContent).then(() => {
        alert('Flowchart code copied to clipboard!')
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = mermaidContent
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Flowchart code copied to clipboard!')
      })
    }
  }

  // Split content into paragraphs and format numbered lists
  const formatContent = (text: string) => {
    const elements: JSX.Element[] = []
    
    // Check if there's JSON or Mermaid content
    const hasJSON = text.includes('```json')
    const hasMermaid = text.includes('```mermaid')
    
    // Split by code blocks first (both JSON and Mermaid)
    const parts = text.split(/(```(?:json|mermaid)[\s\S]*?```)/g)
    
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
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => copyJSONToClipboard(part)}
                  style={{
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#5a2d8f'
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#6f42c1'
                  }}
                >
                  📋 Copy
                </button>
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
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#1557b0'
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#1a73e8'
                  }}
                >
                  📥 Download
                </button>
              </div>
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
      } else if (part.startsWith('```mermaid')) {
        // This is a Mermaid diagram block
        const mermaidContent = part.replace(/```mermaid\s*/, '').replace(/\s*```$/, '').trim()
        elements.push(
          <div key={`mermaid-${partIndex}`} style={{ 
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
                📊 Process Flowchart
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => copyMermaidToClipboard(part)}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#218838'
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#28a745'
                  }}
                >
                  📋 Copy Code
                </button>
                <button
                  onClick={() => extractAndDownloadMermaid(part)}
                  style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#138496'
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#17a2b8'
                  }}
                >
                  📥 Download
                </button>
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
              <MermaidDiagram chart={mermaidContent} />
            </div>
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
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentRecommendation, setCurrentRecommendation] = useState<WorkflowRecommendation | null>(null)
  const [showRecommendation, setShowRecommendation] = useState(false)

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { sessionId, messages: storedMessages } = await StorageService.initializeSession()
        
        if (storedMessages.length > 0) {
          // Convert stored messages to component format
          const formattedMessages = storedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
          setMessages(formattedMessages)
        }
        
        setCurrentSessionId(sessionId)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize session:', error)
        setIsInitialized(true) // Continue even if initialization fails
      }
    }

    initializeSession()
  }, [])

  // Auto-save workflow when JSON is detected in AI response
  const detectAndSaveWorkflow = async (content: string, sessionId: number) => {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      try {
        const jsonContent = jsonMatch[1].trim()
        JSON.parse(jsonContent) // Validate JSON
        await StorageService.saveWorkflow(sessionId, jsonContent)
      } catch (error) {
        console.error('Failed to save workflow:', error)
      }
    }
  }

  // Analyze user message for workflow recommendation
  const analyzeForRecommendation = (userMessage: string) => {
    // Only analyze if this is early in the conversation and contains automation keywords
    const automationKeywords = [
      'automate', 'workflow', 'process', 'trigger', 'when', 'if', 'schedule',
      'integrate', 'connect', 'sync', 'monitor', 'alert', 'notification'
    ]
    
    const hasAutomationIntent = automationKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    )
    
    // Trigger analysis if this looks like an automation request and we haven't shown recommendation yet
    if (hasAutomationIntent && messages.length < 4 && !showRecommendation) {
      const recommendation = WorkflowAnalyzer.analyzeWorkflow(userMessage)
      setCurrentRecommendation(recommendation)
      setShowRecommendation(true)
    }
  }

  // Handle recommendation acceptance
  const handleAcceptRecommendation = (type: WorkflowType) => {
    setShowRecommendation(false)
    // Add a message about the accepted recommendation
    const confirmationMessage = `Perfect! I'll create a ${type.replace('-', ' ')} workflow for you. Let me gather a few more details to build the optimal solution.`
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: confirmationMessage
    }])
    
    // Save the confirmation message
    if (currentSessionId) {
      StorageService.autoSaveMessage('assistant', confirmationMessage)
    }
  }

  // Handle recommendation modification
  const handleModifyRecommendation = () => {
    setShowRecommendation(false)
    const modifyMessage = `I'd be happy to adjust my recommendation! Could you tell me more about your specific requirements or any constraints I should consider?`
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: modifyMessage
    }])
    
    // Save the modify message
    if (currentSessionId) {
      StorageService.autoSaveMessage('assistant', modifyMessage)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    
    // Analyze for workflow recommendation before clearing input
    analyzeForRecommendation(input)
    
    setInput('')
    setIsLoading(true)

    // Auto-save user message and handle session creation
    let sessionId = currentSessionId
    try {
      if (!sessionId) {
        sessionId = await StorageService.createNewSession(input)
        setCurrentSessionId(sessionId)
      }
      await StorageService.autoSaveMessage('user', input)
    } catch (error) {
      console.error('Failed to save user message:', error)
    }

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
                
                // Auto-save complete AI response
                if (sessionId && aiContent) {
                  try {
                    await StorageService.autoSaveMessage('assistant', aiContent)
                    await detectAndSaveWorkflow(aiContent, sessionId)
                  } catch (error) {
                    console.error('Failed to save assistant message:', error)
                  }
                }
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
      const errorMessage = 'Sorry, I encountered an error. Please make sure your Anthropic API key is configured in .env.local and try again.'
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }])
      
      // Save error message too
      if (sessionId) {
        try {
          await StorageService.autoSaveMessage('assistant', errorMessage)
        } catch (saveError) {
          console.error('Failed to save error message:', saveError)
        }
      }
    }
    
    setIsLoading(false)
  }

  // Start new session function
  const startNewSession = async () => {
    try {
      const newSessionId = await StorageService.startNewSession()
      setCurrentSessionId(newSessionId)
      setMessages([])
    } catch (error) {
      console.error('Failed to start new session:', error)
    }
  }

  // Load existing session
  const loadSession = async (sessionId: number) => {
    try {
      const messages = await StorageService.loadSession(sessionId)
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      setMessages(formattedMessages)
      setCurrentSessionId(sessionId)
    } catch (error) {
      console.error('Failed to load session:', error)
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
            n8n Workflow Assistant
          </p>
          {isInitialized && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <SessionHistory 
                currentSessionId={currentSessionId}
                onSessionSelect={loadSession}
                onNewSession={startNewSession}
              />
              {messages.length > 0 && (
                <button
                  onClick={startNewSession}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  New Session
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ 
        flex: 1, 
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%'
      }}>
        {!isInitialized ? (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <p style={{ color: '#666' }}>Loading...</p>
          </div>
        ) : messages.length === 0 ? (
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
            
            {/* Show workflow recommendation if available */}
            {showRecommendation && currentRecommendation && (
              <div style={{ margin: '1.5rem 0' }}>
                <WorkflowRecommendationComponent
                  recommendation={currentRecommendation}
                  onAccept={handleAcceptRecommendation}
                  onModify={handleModifyRecommendation}
                />
              </div>
            )}
            
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
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Describe your automation idea... (Shift+Enter for new line)"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              resize: 'vertical',
              minHeight: '2.5rem',
              maxHeight: '8rem',
              fontFamily: 'inherit'
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
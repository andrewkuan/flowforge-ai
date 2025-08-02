'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import EditableProcessPanel from '@/components/EditableProcessPanel'
import AutomationSuggestionsPanel from '@/components/AutomationSuggestionsPanel'

import MermaidDiagram from '@/components/MermaidDiagram'

// Local type definitions (simplified without database dependencies)
interface ProcessStep {
  id: string
  content: string
}

type WorkflowState = 
  | 'initial'
  | 'process_generated'
  | 'process_confirmed'
  | 'automation_generated'
  | 'workflow_generated'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Component to format AI messages with better structure
function FormattedMessage({ 
  content, 
  hideFlowcharts = false, 
  copyMermaidToClipboard, 
  extractAndDownloadMermaid 
}: { 
  content: string, 
  hideFlowcharts?: boolean,
  copyMermaidToClipboard: (text: string) => void,
  extractAndDownloadMermaid: (text: string) => void
}) {
  
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
    console.log('📋 Copy button clicked, text content:', text.substring(0, 200) + '...')
    
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    console.log('📋 JSON match found:', !!jsonMatch)
    
    if (jsonMatch) {
      const jsonContent = jsonMatch[1].trim()
      console.log('📋 Extracted JSON content:', jsonContent.substring(0, 200) + '...')
      
      try {
        // Validate JSON
        JSON.parse(jsonContent)
        console.log('📋 JSON validation successful')
        
        // Copy to clipboard
        navigator.clipboard.writeText(jsonContent).then(() => {
          console.log('📋 Successfully copied to clipboard')
          alert('JSON workflow copied to clipboard!')
        }).catch((error) => {
          console.log('📋 Clipboard API failed, using fallback:', error)
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
        console.log('📋 JSON validation failed:', e)
        alert('Invalid JSON format')
      }
    } else {
      console.log('📋 No JSON code block found in content')
      alert('No JSON workflow found to copy')
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
        if (hideFlowcharts) {
          // Show a placeholder in the main chat when flowcharts are in sidebar
          elements.push(
            <div key={`mermaid-placeholder-${partIndex}`} style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e1e5e9',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem',
              color: '#6c757d'
            }}>
              📊 Flowchart moved to sidebar →
            </div>
          )
        } else {
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
        }
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

  const [flowcharts, setFlowcharts] = useState<Array<{id: string, content: string, title: string}>>([])
  const [hasActiveFlowchart, setHasActiveFlowchart] = useState(false)
  
  // Process panel state
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([])
  const [showProcessPanel, setShowProcessPanel] = useState(false)
  const [automationSuggestions, setAutomationSuggestions] = useState<string[]>([])
  const [showAutomationSuggestions, setShowAutomationSuggestions] = useState(false)
  const [workflowState, setWorkflowState] = useState<WorkflowState>('initial')
  
  // New simplified state for explicit user control
  type FlowStep = 'chat' | 'process_editing' | 'automation_viewing' | 'workflow_generated'
  const [currentStep, setCurrentStep] = useState<FlowStep>('chat')
  const [showExtractButton, setShowExtractButton] = useState(false)


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

  // Extract and download Mermaid diagram
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

  // Extract flowcharts from messages and update flowchart state
  const updateFlowcharts = () => {
    const foundFlowcharts: Array<{id: string, content: string, title: string}> = []
    
    messages.forEach((message, index) => {
      if (message.role === 'assistant') {
        const mermaidMatches = message.content.match(/```mermaid\s*([\s\S]*?)\s*```/g)
        if (mermaidMatches) {
          mermaidMatches.forEach((match, matchIndex) => {
            const content = match.replace(/```mermaid\s*/, '').replace(/\s*```$/, '').trim()
            foundFlowcharts.push({
              id: `flowchart-${index}-${matchIndex}`,
              content,
              title: `Process Flowchart ${foundFlowcharts.length + 1}`
            })
          })
        }
      }
    })
    
    setFlowcharts(foundFlowcharts)
    setHasActiveFlowchart(foundFlowcharts.length > 0)
  }

  // Update flowcharts when messages change
  useEffect(() => {
    updateFlowcharts()
  }, [messages])

  // Function to parse process steps from AI response
  const parseProcessSteps = (content: string): ProcessStep[] => {
    const steps: ProcessStep[] = []
    
    // Look for the "Current Process:" section and extract numbered steps
    const processMatch = content.match(/\*\*Current Process:\*\*\s*([\s\S]*?)(?=\n\n|\nDoes this capture|$)/i)
    
    if (processMatch) {
      const processSection = processMatch[1]
      const numberedListRegex = /^(\d+)\.\s*(.+)$/gm
      let match
      
      while ((match = numberedListRegex.exec(processSection)) !== null) {
        steps.push({
          id: `step_${match[1]}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: match[2].trim()
        })
      }
    } else {
      // Fallback: Look for any numbered list patterns
      const numberedListRegex = /^(\d+)\.\s*(.+)$/gm
      let match
      
      while ((match = numberedListRegex.exec(content)) !== null) {
        steps.push({
          id: `step_${match[1]}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: match[2].trim()
        })
      }
    }
    
    return steps
  }

  // Function to detect if AI response contains a process suggestion
  const detectProcessSuggestion = (content: string): boolean => {
    const processIndicators = [
      '**current process:**',
      'current process:',
      'does this capture the process accurately',
      'let me know if i\'m missing anything'
    ]
    
    const lowerContent = content.toLowerCase()
    return processIndicators.some(indicator => lowerContent.includes(indicator))
  }

  // Function to detect if AI response contains automation suggestions
  const detectAutomationSuggestions = (content: string): boolean => {
    const lowerContent = content.toLowerCase()
    
    // Primary indicators
    const strongIndicators = [
      'automation suggestions',
      '**automation suggestions:**',
      'automate using n8n',
      'steps should be automated',
      'automation opportunities',
      'good candidates for automation',
      'can be automated',
      'should automate'
    ]
    
    // Secondary indicators
    const secondaryIndicators = [
      'n8n node',
      'http request node',
      'email node', 
      'schedule trigger',
      'webhook',
      'trigger',
      'automating',
      'automate',
      'workflow'
    ]
    
    // Check for strong indicators
    const hasStrongIndicator = strongIndicators.some(indicator => lowerContent.includes(indicator))
    
    // Check for context clues that this is automation-related
    const isAutomationContext = (
      lowerContent.includes('analyze') && lowerContent.includes('process') && 
      (lowerContent.includes('automat') || lowerContent.includes('n8n'))
    )
    
    // Count automation-related numbered items
    const lines = content.split('\n')
    let automationLines = 0
    let numberedLines = 0
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.match(/^\d+\./)) {
        numberedLines++
        if (trimmedLine.toLowerCase().includes('automat') || 
            trimmedLine.toLowerCase().includes('n8n') ||
            secondaryIndicators.some(indicator => trimmedLine.toLowerCase().includes(indicator))) {
          automationLines++
        }
      }
    }
    
    // Special detection for the exact format in user's example:
    // "**Automation Suggestions:**" followed by numbered items like "1.**Email Trigger**:"
    const hasAutomationHeader = lowerContent.includes('**automation suggestions:**')
    const hasSpecialFormat = hasAutomationHeader && numberedLines >= 3
    
    // More flexible detection logic
    const isAutomationResponse = (
      hasStrongIndicator || 
      isAutomationContext ||
      hasSpecialFormat ||
      (automationLines >= 2) ||
      (numberedLines >= 3 && lowerContent.includes('automat')) ||
      (numberedLines >= 4 && secondaryIndicators.some(indicator => lowerContent.includes(indicator)))
    )
    
    console.log('🔍 Enhanced Automation Detection:', { 
      hasStrongIndicator, 
      isAutomationContext,
      hasAutomationHeader,
      hasSpecialFormat,
      automationLines, 
      numberedLines,
      isAutomationResponse,
      contentPreview: content.substring(0, 300) + '...',
      fullContentLength: content.length
    })
    
    // If detection fails, log the full content for debugging
    if (!isAutomationResponse && content.length > 100) {
      console.log('❌ Detection Failed - Full AI Response:', content)
    }
    
    return isAutomationResponse
  }

  // Function to parse automation suggestions from AI response
  const parseAutomationSuggestions = (content: string): string[] => {
    const suggestions: string[] = []
    const lines = content.split('\n')
    
    // Multiple parsing strategies
    
    // Strategy 1: Look for clear automation section
    let inAutomationSection = false
    let foundAutomationHeader = false
    
    // Strategy 2: Collect all numbered items that seem automation-related
    const potentialSuggestions: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      const lowerLine = trimmedLine.toLowerCase()
      
      // Check for automation section headers
      if (lowerLine.includes('automation') || 
          lowerLine.includes('automate') ||
          lowerLine.includes('n8n') ||
          lowerLine.includes('steps should be automated') ||
          lowerLine.includes('opportunities')) {
        inAutomationSection = true
        foundAutomationHeader = true
        continue
      }
      
      // Parse numbered items - handle both "1. text" and "1.**text**:" formats
      const numberMatch = trimmedLine.match(/^(\d+)\.(\*\*)?(.+?)(\*\*)?:?\s*(.*)$/) || 
                         trimmedLine.match(/^(\d+)\.?\s*(.+)$/)
      
      if (numberMatch) {
        // For format "1.**Email Trigger**: description", extract the title and description
        let suggestion = ''
        if (numberMatch.length >= 6 && numberMatch[3] && numberMatch[5]) {
          // Format: "1.**Title**: Description"
          suggestion = `${numberMatch[3].trim()}: ${numberMatch[5].trim()}`
        } else if (numberMatch[2]) {
          // Format: "1. Description"
          suggestion = numberMatch[2].trim()
        } else {
          // Fallback
          suggestion = trimmedLine.replace(/^\d+\.(\*\*)?/, '').replace(/(\*\*)?:?$/, '').trim()
        }
        
        if (suggestion) {
          const suggestionLower = suggestion.toLowerCase()
          
          // Strategy 1: If we're in an automation section, add everything
          if (inAutomationSection) {
            suggestions.push(suggestion)
          }
          
          // Strategy 2: Add if content seems automation-related
          if (suggestionLower.includes('automat') || 
              suggestionLower.includes('n8n') ||
              suggestionLower.includes('node') ||
              suggestionLower.includes('trigger') ||
              suggestionLower.includes('webhook') ||
              suggestionLower.includes('api') ||
              suggestionLower.includes('email') ||
              suggestionLower.includes('schedule') ||
              suggestionLower.includes('integrate') ||
              suggestionLower.includes('workflow')) {
            potentialSuggestions.push(suggestion)
          }
        }
      }
      
      // Stop if we hit a clear non-automation section
      if (inAutomationSection && trimmedLine.length > 0 && 
          !trimmedLine.match(/^\d+\./) && 
          !trimmedLine.match(/^[-*]/) &&
          !lowerLine.includes('automat') &&
          !lowerLine.includes('n8n') &&
          lowerLine.length > 10) {
        if (!foundAutomationHeader) {
          inAutomationSection = false
        }
      }
    }
    
    // Use the best strategy result
    const finalSuggestions = suggestions.length > 0 ? suggestions : potentialSuggestions
    
    // Strategy 3: If we still don't have suggestions but content seems automation-related
    if (finalSuggestions.length === 0) {
      const lowerContent = content.toLowerCase()
      if ((lowerContent.includes('automat') || lowerContent.includes('n8n')) && 
          lowerContent.includes('suggest')) {
        // Extract any numbered or bulleted lists
        for (const line of lines) {
          const trimmedLine = line.trim()
          const listMatch = trimmedLine.match(/^(?:\d+\.|\*|\-)\s*(.+)$/)
          if (listMatch && listMatch[1] && listMatch[1].length > 10) {
            finalSuggestions.push(listMatch[1].trim())
          }
        }
      }
    }
    
    console.log('📝 Enhanced Parsing Result:', { 
      strategiesUsed: {
        sectionBased: suggestions.length,
        contentBased: potentialSuggestions.length,
        final: finalSuggestions.length
      },
      suggestions: finalSuggestions,
      contentPreview: content.substring(0, 500) + '...'
    })
    
    return finalSuggestions.slice(0, 10) // Limit to 10 suggestions max
  }

  // Handle extracting process steps from AI response
  const handleExtractProcessSteps = () => {
    console.log('🔍 User clicked Extract Process Steps')
    setShowExtractButton(false)
    
    // Get the latest AI message
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      const steps = parseProcessSteps(lastMessage.content)
      console.log('📝 Extracted steps:', steps)
      
      if (steps.length > 0) {
        setProcessSteps(steps)
        setShowProcessPanel(true)
        setCurrentStep('process_editing')
        
        // Note: No database saving in simplified version
      } else {
        // If no steps found, create default ones
        const defaultSteps: ProcessStep[] = [
          { id: '1', content: 'Review the process described in the AI response' },
          { id: '2', content: 'Edit and refine the process steps' },
          { id: '3', content: 'Add any missing steps' }
        ]
        setProcessSteps(defaultSteps)
        setShowProcessPanel(true)
        setCurrentStep('process_editing')
      }
    }
  }

  // Handle getting automation ideas
  const handleGetAutomationIdeas = () => {
    console.log('🤖 User clicked Get Automation Ideas')
    setShowProcessPanel(false)
    
    const processText = processSteps.map((step, index) => `${index + 1}. ${step.content}`).join('\n')
    const automationMessage = `Perfect! Here's my refined process:\n\n${processText}\n\nNow please suggest automation opportunities for this process using n8n.\n\n**Automation Suggestions:**\n\nPlease provide specific automation suggestions with n8n nodes and explanations.`
    
    setMessages(prev => [...prev, { role: 'user', content: automationMessage }])
    setInput('')
    setIsLoading(true)
    setCurrentStep('chat')

    // Note: No auto-saving in simplified version
    
    // Send to AI using existing fetch logic
    const updatedMessages = [...messages, { role: 'user', content: automationMessage }]
    
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages }),
    }).then(async response => {
      if (!response.ok) throw new Error('Failed to get response')
      
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let aiContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsLoading(false)
              // Show save button after automation response
              setShowExtractButton(true)
              console.log('🤖 Automation response complete, showing save button')
            } else {
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  aiContent += parsed.content
                  setMessages(prev => {
                    const newMessages = [...prev]
                    if (newMessages[newMessages.length - 1]?.role === 'assistant') {
                      newMessages[newMessages.length - 1].content = aiContent
                    } else {
                      newMessages.push({ role: 'assistant', content: aiContent })
                    }
                    return newMessages
                  })
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    }).catch(error => {
      console.error('Error:', error)
      setIsLoading(false)
    })
  }

  // Handle saving automation ideas
  const handleSaveAutomationIdeas = () => {
    console.log('💾 User clicked Save Automation Ideas')
    setShowExtractButton(false)
    
    // Get the latest AI message
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      const suggestions = parseAutomationSuggestions(lastMessage.content)
      console.log('💾 Saving suggestions:', suggestions)
      
      if (suggestions.length > 0) {
        setAutomationSuggestions(suggestions)
        setShowAutomationSuggestions(true)
        setCurrentStep('automation_viewing')
        
        // Note: No database saving in simplified version
        console.log('✅ Saved to local state successfully')
      }
    }
  }

  // Handle process steps changes
  const handleProcessStepsChange = (steps: ProcessStep[]) => {
    setProcessSteps(steps)
    // Note: No database saving in simplified version
  }

  // Handle process confirmation
  const handleProcessConfirm = () => {
    // Check if automation suggestions were already generated
    if (workflowState === 'automation_generated') {
      // If automation suggestions already exist, switch to showing them
      setShowProcessPanel(false)
      setShowAutomationSuggestions(true)
      return
    }
    
    // If process hasn't been confirmed yet, confirm it and request automation suggestions
    if (workflowState === 'process_generated') {
      setShowProcessPanel(false)
      
      // Update workflow state to confirmed
      setWorkflowState('process_confirmed')
      
      // Create a detailed message asking for automation suggestions
      const processText = processSteps.map((step, index) => `${index + 1}. ${step.content}`).join('\n')
      const confirmationMessage = `Great! Here's my refined process:\n\n${processText}\n\nNow please analyze this process and suggest which specific steps should be automated using n8n. 

**Automation Suggestions:**

For each automation suggestion, explain what n8n nodes could be used and why that step is a good candidate for automation. Present your response as a numbered list of automation opportunities.`
      
      setMessages(prev => [...prev, { role: 'user', content: confirmationMessage }])
      setInput('')
      setIsLoading(true)

      // Note: No auto-saving in simplified version

      // Send to AI
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: confirmationMessage }]
      }),
    }).then(async response => {
      if (!response.ok) throw new Error('Failed to get response')
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiContent = ''

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
                    newMessages[newMessages.length - 1].content = aiContent
                    return newMessages
                  })
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      setIsLoading(false)
      
      // Auto-save AI response
      // Note: No auto-saving in simplified version
    }).catch(error => {
      console.error('Error:', error)
      setIsLoading(false)
    })
    }
  }

  // Handle automation confirmation
  const handleAutomationConfirm = () => {
    setShowAutomationSuggestions(false)
    
    // Create message asking for final n8n workflow
    const processText = processSteps.map((step, index) => `${index + 1}. ${step.content}`).join('\n')
    const automationText = automationSuggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')
    const confirmationMessage = `Perfect! Please create the complete n8n workflow JSON for this process:\n\n**Process Steps:**\n${processText}\n\n**Automation Points:**\n${automationText}\n\nGenerate the complete n8n workflow JSON that I can import directly into n8n.`
    
    setMessages(prev => [...prev, { role: 'user', content: confirmationMessage }])
    setInput('')
    setIsLoading(true)

    // Auto-save and send to AI, and update workflow state
    setWorkflowState('workflow_generated')

    // Send to AI
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: confirmationMessage }]
      }),
    }).then(async response => {
      if (!response.ok) throw new Error('Failed to get response')
      
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiContent = ''

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
                    newMessages[newMessages.length - 1].content = aiContent
                    return newMessages
                  })
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      setIsLoading(false)
      
      // Auto-save AI response
      // Note: No auto-saving in simplified version
    }).catch(error => {
      console.error('Error:', error)
      setIsLoading(false)
    })
  }

  // Note: No session initialization needed in simplified version

  // Auto-scroll to show automation panel when it opens
  useEffect(() => {
    if (showAutomationSuggestions) {
      // Small delay to ensure panel is rendered before scrolling
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        console.log('📍 Auto-scrolled to show automation panel')
      }, 100)
    }
  }, [showAutomationSuggestions])

  // Note: detectAndSaveWorkflow removed in simplified version













  // Reset chat function to clear all state
  const resetChat = () => {
    setMessages([])
    setInput('')
    setIsLoading(false)
    setFlowcharts([])
    setHasActiveFlowchart(false)
    setProcessSteps([])
    setShowProcessPanel(false)
    setAutomationSuggestions([])
    setShowAutomationSuggestions(false)
    setWorkflowState('initial')
    setCurrentStep('chat')
    setShowExtractButton(false)
    console.log('🔄 Chat reset - all state cleared')
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    
    setInput('')
    setIsLoading(true)

    // Note: No session management or auto-saving in simplified version

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
                
                console.log('✅ SIMPLE: AI response complete, showing extract button')
                
                // Simple approach: After any AI response, show extract button
                if (currentStep === 'chat' && aiContent.length > 100) {
                  setShowExtractButton(true)
                  console.log('📝 Extract button now visible for user')
                }
                
                // Note: No auto-saving in simplified version
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
      
      // Note: No error message saving in simplified version
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
            n8n Workflow Assistant
          </p>
          {messages.length > 0 && (
            <button
              onClick={resetChat}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
                e.currentTarget.style.borderColor = '#999'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = '#ddd'
              }}
            >
              🔄 Reset Chat
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex',
        maxWidth: '1400px', // Fixed width to prevent jarring resize when panels appear
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Chat Area */}
        <div style={{ 
          flex: 1,
          padding: '2rem',
          paddingRight: (hasActiveFlowchart || showProcessPanel || showAutomationSuggestions) ? '1rem' : '2rem'
        }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2 style={{ color: 'black', marginBottom: '1rem' }}>
              Let's create your n8n workflow
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Describe your process or problem, and I'll help you identify automation opportunities and build an n8n workflow.
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
                    <FormattedMessage 
                      content={message.content} 
                      hideFlowcharts={hasActiveFlowchart}
                      copyMermaidToClipboard={copyMermaidToClipboard}
                      extractAndDownloadMermaid={extractAndDownloadMermaid}
                    />
                  ) : (
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: '1.5'
                    }}>
                      {message.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Extract Process Steps Button */}
            {showExtractButton && currentStep === 'chat' && 
             !(messages.length > 0 && messages[messages.length - 1]?.content?.includes('**Automation Suggestions:**')) && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '1rem',
                marginBottom: '1rem' 
              }}>
                <button
                  onClick={handleExtractProcessSteps}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  📝 Extract Process Steps
                </button>
              </div>
            )}
            
            {/* Save Automation Ideas Button */}
            {showExtractButton && currentStep === 'chat' && messages.length > 0 && 
             messages[messages.length - 1]?.content?.includes('**Automation Suggestions:**') && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '1rem',
                marginBottom: '1rem' 
              }}>
                <button
                  onClick={handleSaveAutomationIdeas}
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                >
                  💾 Save Automation Ideas
                </button>
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

        {/* Flowchart Sidebar */}
        {hasActiveFlowchart && (
          <div style={{
            width: '400px',
            padding: '2rem 2rem 2rem 1rem',
            borderLeft: '1px solid #e5e5e5',
            backgroundColor: '#fafafa',
            overflowY: 'auto'
          }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              margin: '0 0 1rem 0',
              color: '#2c3e50'
            }}>
              📊 Process Flowcharts
            </h3>
            {flowcharts.map((flowchart, index) => (
              <div key={flowchart.id} style={{
                marginBottom: '2rem',
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f6f8fa',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e1e5e9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    color: '#656d76', 
                    fontWeight: '500' 
                  }}>
                    {flowchart.title}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => copyMermaidToClipboard(`\`\`\`mermaid\n${flowchart.content}\n\`\`\``)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                      title="Copy flowchart code"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => extractAndDownloadMermaid(`\`\`\`mermaid\n${flowchart.content}\n\`\`\``)}
                      style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                      title="Download flowchart"
                    >
                      📥
                    </button>
                  </div>
                </div>
                <div style={{ padding: '1rem' }}>
                  <MermaidDiagram chart={flowchart.content} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Process Panel */}
        <EditableProcessPanel
          processSteps={processSteps}
          onStepsChange={handleProcessStepsChange}
          onConfirm={handleGetAutomationIdeas}
          isVisible={showProcessPanel}
          title="Your Current Process"
          workflowState={workflowState}
        />

        {/* Automation Suggestions Panel */}
        <AutomationSuggestionsPanel
          suggestions={automationSuggestions}
          onConfirm={handleAutomationConfirm}
          isVisible={showAutomationSuggestions}
          title="Automation Opportunities"
        />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '1rem 2rem',
        borderTop: '1px solid #e5e5e5',
        backgroundColor: 'white'
      }}>
        <div style={{ 
          maxWidth: '1400px', // Fixed width to prevent jarring resize when panels appear 
          margin: '0 auto',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end'
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
            placeholder="Continue the conversation... (Shift+Enter for new line)"
            style={{
              flex: 1,
              padding: '1rem 1.25rem',
              border: '2px solid #e1e5e9',
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              resize: 'none',
              minHeight: '3rem',
              maxHeight: '8rem',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              transition: 'border-color 0.2s',
              backgroundColor: '#fafafa'
            }}
            onFocus={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.borderColor = '#1a73e8'
              target.style.backgroundColor = 'white'
            }}
            onBlur={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.borderColor = '#e1e5e9'
              target.style.backgroundColor = '#fafafa'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              backgroundColor: input.trim() ? '#1a73e8' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
              minHeight: '3rem',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseOver={(e) => {
              if (input.trim()) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1557b0'
              }
            }}
            onMouseOut={(e) => {
              if (input.trim()) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1a73e8'
              }
            }}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
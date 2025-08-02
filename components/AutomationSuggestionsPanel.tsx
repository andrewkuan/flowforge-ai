'use client'

import { useState } from 'react'

interface AutomationSuggestionsPanelProps {
  suggestions: string[]
  onConfirm: () => void
  isVisible: boolean
  title?: string
}

export default function AutomationSuggestionsPanel({
  suggestions,
  onConfirm,
  isVisible,
  title = "Automation Opportunities"
}: AutomationSuggestionsPanelProps) {

  if (!isVisible) return null

  return (
    <div style={{
      width: '400px',
      padding: '2rem 2rem 2rem 1rem',
      borderLeft: '1px solid #e5e5e5',
      backgroundColor: '#fafafa',
      overflowY: 'auto',
      height: '100%'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #e1e5e9'
      }}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '600', 
          margin: '0 0 0.5rem 0',
          color: '#2c3e50'
        }}>
          🤖 {title}
        </h3>
        <div style={{
          fontSize: '0.85rem',
          color: '#666',
          margin: 0,
          lineHeight: 1.4
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Based on your process, here are the recommended automation points. Review and confirm to generate your n8n workflow.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#e8f5e8',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#2e7d32'
          }}>
            <span>💾</span>
            <span>Automation suggestions saved for this session</span>
          </div>
        </div>
      </div>

      {/* Automation Suggestions */}
      <div style={{ marginBottom: '1.5rem' }}>
        {suggestions.map((suggestion, index) => (
          <div key={index} style={{
            marginBottom: '1rem',
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            backgroundColor: 'white',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '1rem'
            }}>
              {/* Automation Icon */}
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#f57c00',
                backgroundColor: '#fff3e0',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                ⚡
              </div>

              {/* Suggestion Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.9rem',
                  lineHeight: 1.4,
                  color: '#2c3e50',
                  padding: '0.25rem'
                }}>
                  {suggestion}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div style={{
        backgroundColor: '#e8f4fd',
        border: '1px solid #b3d9f2',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          fontSize: '0.85rem',
          color: '#1565c0',
          lineHeight: 1.4
        }}>
          <strong>💡 Ready to automate?</strong><br/>
          These suggestions will be used to create your n8n workflow with the appropriate nodes and connections.
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          backgroundColor: '#f57c00',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#ef6c00'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#f57c00'
        }}
      >
        🚀 Generate n8n Workflow
      </button>
    </div>
  )
}
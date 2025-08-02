'use client'

import { useState, useEffect } from 'react'
import { StorageService } from '@/lib/storage'
import { ChatSession } from '@/lib/database'

interface SessionHistoryProps {
  currentSessionId: number | null
  onSessionSelect: (sessionId: number) => void
  onNewSession: () => void
}

export default function SessionHistory({ 
  currentSessionId, 
  onSessionSelect, 
  onNewSession 
}: SessionHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [currentSessionId])

  const loadSessions = async () => {
    try {
      const allSessions = await StorageService.getAllSessions()
      setSessions(allSessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const handleSessionClick = async (sessionId: number) => {
    if (sessionId !== currentSessionId) {
      onSessionSelect(sessionId)
    }
    setIsExpanded(false)
  }

  const handleDeleteSession = async (sessionId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await StorageService.deleteSession(sessionId)
        await loadSessions()
        
        // If we deleted the current session, start a new one
        if (sessionId === currentSessionId) {
          onNewSession()
        }
      } catch (error) {
        console.error('Failed to delete session:', error)
      }
    }
  }

  if (sessions.length === 0) {
    return null
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          backgroundColor: 'transparent',
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '0.25rem 0.75rem',
          fontSize: '0.8rem',
          cursor: 'pointer',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        📚 History ({sessions.length})
        <span style={{ fontSize: '0.7rem' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          minWidth: '300px',
          maxWidth: '400px',
          maxHeight: '300px',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => session.id && handleSessionClick(session.id)}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                backgroundColor: session.id === currentSessionId ? '#f8f9fa' : 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (session.id !== currentSessionId) {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8f9fa'
                }
              }}
              onMouseOut={(e) => {
                if (session.id !== currentSessionId) {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'white'
                }
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: session.id === currentSessionId ? '600' : '400',
                  color: '#2c3e50',
                  marginBottom: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {session.title}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                  {session.id === currentSessionId && (
                    <span style={{ color: '#1a73e8', fontWeight: '500' }}>
                      Current
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={(e) => session.id && handleDeleteSession(session.id, e)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  marginLeft: '0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#ff6b6b'
                  ;(e.target as HTMLButtonElement).style.color = 'white'
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                  ;(e.target as HTMLButtonElement).style.color = '#666'
                }}
              >
                ×
              </button>
            </div>
          ))}
          
          <div
            onClick={onNewSession}
            style={{
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              backgroundColor: 'white',
              color: '#1a73e8',
              fontSize: '0.9rem',
              fontWeight: '500',
              textAlign: 'center',
              borderTop: '1px solid #f0f0f0'
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8f9fa'
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = 'white'
            }}
          >
            + Start New Session
          </div>
        </div>
      )}
    </div>
  )
}
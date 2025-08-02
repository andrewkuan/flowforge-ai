'use client'

import { useState, useEffect } from 'react'

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

interface EditableProcessPanelProps {
  processSteps: ProcessStep[]
  onStepsChange: (steps: ProcessStep[]) => void
  onConfirm: () => void
  isVisible: boolean
  title?: string
  workflowState?: WorkflowState
}

export default function EditableProcessPanel({
  processSteps,
  onStepsChange,
  onConfirm,
  isVisible,
  title = "Your Current Process",
  workflowState = 'initial'
}: EditableProcessPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleEdit = (step: ProcessStep) => {
    setEditingId(step.id)
    setEditValue(step.content)
  }

  const handleSave = () => {
    if (editingId) {
      const updatedSteps = processSteps.map(step =>
        step.id === editingId ? { ...step, content: editValue } : step
      )
      onStepsChange(updatedSteps)
      setEditingId(null)
      setEditValue('')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleAddStep = () => {
    const newStep: ProcessStep = {
      id: `step_${Date.now()}`,
      content: 'New step - click to edit'
    }
    onStepsChange([...processSteps, newStep])
  }

  const handleRemoveStep = (stepId: string) => {
    const updatedSteps = processSteps.filter(step => step.id !== stepId)
    onStepsChange(updatedSteps)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

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
          ✏️ {title}
        </h3>
        <div style={{
          fontSize: '0.85rem',
          color: '#666',
          margin: 0,
          lineHeight: 1.4
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            Click any step to edit it. Use the + button to add new steps.
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#1976d2'
          }}>
            <span>💾</span>
            <span>Process steps saved for this session</span>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div style={{ marginBottom: '1.5rem' }}>
        {processSteps.map((step, index) => (
          <div key={step.id} style={{
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
              {/* Step Number */}
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#1a73e8',
                backgroundColor: '#e8f0fe',
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
                {index + 1}
              </div>

              {/* Step Content */}
              <div style={{ flex: 1 }}>
                {editingId === step.id ? (
                  <div>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '0.5rem',
                        border: '1px solid #1a73e8',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Describe this step..."
                      autoFocus
                    />
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <button
                        onClick={handleSave}
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
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        style={{
                          backgroundColor: '#f1f3f4',
                          color: '#5f6368',
                          border: 'none',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      onClick={() => handleEdit(step)}
                      style={{
                        fontSize: '0.9rem',
                        lineHeight: 1.4,
                        color: '#2c3e50',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f3f4'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      {step.content}
                    </div>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {editingId !== step.id && (
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    marginLeft: '0.5rem',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8d7da'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  title="Remove step"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Step Button */}
      <button
        onClick={handleAddStep}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          color: '#666',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          marginBottom: '1.5rem',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#1a73e8'
          e.currentTarget.style.color = '#1a73e8'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#ccc'
          e.currentTarget.style.color = '#666'
        }}
      >
        + Add Step
      </button>

      {/* Get Automation Ideas Button */}
      <button
        onClick={onConfirm}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          backgroundColor: '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#047857'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#059669'
        }}
      >
        🤖 Get Automation Ideas
      </button>
    </div>
  )
}
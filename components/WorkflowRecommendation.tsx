'use client'

import { WorkflowRecommendation, WorkflowType } from '@/lib/workflow-analyzer'

interface WorkflowRecommendationProps {
  recommendation: WorkflowRecommendation
  onAccept: (type: WorkflowType) => void
  onModify: () => void
}

const getTypeColor = (type: WorkflowType): string => {
  switch (type) {
    case 'deterministic': return '#2563eb' // Blue
    case 'ai-enhanced': return '#7c3aed' // Purple
    case 'agentic': return '#dc2626' // Red
    default: return '#6b7280' // Gray
  }
}

const getTypeIcon = (type: WorkflowType): string => {
  switch (type) {
    case 'deterministic': return '⚙️'
    case 'ai-enhanced': return '🧠'
    case 'agentic': return '🤖'
    default: return '❓'
  }
}

const getComplexityColor = (complexity: string): string => {
  switch (complexity) {
    case 'low': return '#10b981' // Green
    case 'medium': return '#f59e0b' // Yellow
    case 'high': return '#ef4444' // Red
    default: return '#6b7280' // Gray
  }
}

export default function WorkflowRecommendationComponent({ 
  recommendation, 
  onAccept, 
  onModify 
}: WorkflowRecommendationProps) {
  const typeColor = getTypeColor(recommendation.type)
  const typeIcon = getTypeIcon(recommendation.type)
  const complexityColor = getComplexityColor(recommendation.complexity)

  return (
    <div style={{
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '1.5rem',
      margin: '1rem 0',
      backgroundColor: '#fafafa',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{typeIcon}</span>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: typeColor,
              margin: 0,
              textTransform: 'capitalize'
            }}>
              {recommendation.type.replace('-', ' ')} Workflow
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              margin: 0
            }}>
              Confidence: {recommendation.confidence}% • 
              Complexity: <span style={{ color: complexityColor, fontWeight: '600' }}>
                {recommendation.complexity}
              </span> • 
              Setup: {recommendation.estimatedSetupTime}
            </p>
          </div>
        </div>
        
        <div style={{
          backgroundColor: typeColor,
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          RECOMMENDED
        </div>
      </div>

      {/* Rationale */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Why this approach?
        </h4>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {recommendation.rationale.map((reason, index) => (
            <li key={index} style={{
              fontSize: '0.9rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Examples */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Example use cases:
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.5rem'
        }}>
          {recommendation.examples.map((example, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '0.75rem',
              fontSize: '0.85rem',
              color: '#4b5563'
            }}>
              • {example}
            </div>
          ))}
        </div>
      </div>

      {/* Trade-offs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Pros */}
        <div>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#059669',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✅ Advantages
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            {recommendation.tradeoffs.pros.map((pro, index) => (
              <li key={index} style={{
                fontSize: '0.85rem',
                color: '#065f46',
                marginBottom: '0.25rem'
              }}>
                {pro}
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚠️ Considerations
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            {recommendation.tradeoffs.cons.map((con, index) => (
              <li key={index} style={{
                fontSize: '0.85rem',
                color: '#991b1b',
                marginBottom: '0.25rem'
              }}>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => onAccept(recommendation.type)}
          style={{
            backgroundColor: typeColor,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            flex: 1
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 
              recommendation.type === 'deterministic' ? '#1d4ed8' :
              recommendation.type === 'ai-enhanced' ? '#6d28d9' : '#b91c1c'
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = typeColor
          }}
        >
          ✨ Generate {recommendation.type.replace('-', ' ')} Workflow
        </button>
        
        <button
          onClick={onModify}
          style={{
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'
            ;(e.target as HTMLButtonElement).style.borderColor = '#9ca3af'
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
            ;(e.target as HTMLButtonElement).style.borderColor = '#d1d5db'
          }}
        >
          🔄 Modify Requirements
        </button>
      </div>
    </div>
  )
}
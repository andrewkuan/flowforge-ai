'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export default function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Initialize mermaid with configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      themeVariables: {
        primaryColor: '#1a73e8',
        primaryTextColor: '#2c3e50',
        primaryBorderColor: '#e1e5e9',
        lineColor: '#6c757d',
        sectionBkgColor: '#f6f8fa',
        altSectionBkgColor: '#ffffff',
        gridColor: '#e1e5e9',
        tertiaryColor: '#f8f9fa'
      }
    })

    const renderDiagram = async () => {
      // Double check ref is available
      if (!ref.current) {
        console.warn('Mermaid ref not available')
        return
      }

      try {
        // Clear previous content safely
        if (ref.current) {
          ref.current.innerHTML = ''
        }
        
        // Generate unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Render the diagram
        const { svg } = await mermaid.render(id, chart)
        
        // Set SVG content safely
        if (ref.current) {
          ref.current.innerHTML = svg
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error)
        
        // Set error content safely
        if (ref.current) {
          ref.current.innerHTML = `
            <div style="
              padding: 1rem; 
              border: 1px solid #dc3545; 
              border-radius: 4px; 
              background-color: #f8d7da; 
              color: #721c24;
              font-family: monospace;
              font-size: 0.9rem;
            ">
              <strong>Flowchart Rendering Error:</strong><br/>
              ${error instanceof Error ? error.message : 'Invalid Mermaid syntax'}
              <br/><br/>
              <details>
                <summary>Chart Content:</summary>
                <pre style="margin-top: 0.5rem; white-space: pre-wrap;">${chart}</pre>
              </details>
            </div>
          `
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(renderDiagram, 100)
    
    return () => clearTimeout(timer)
  }, [chart])

  return (
    <div 
      ref={ref} 
      className={className}
      style={{
        width: '100%',
        textAlign: 'center',
        padding: '1rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        overflow: 'auto'
      }}
    />
  )
}
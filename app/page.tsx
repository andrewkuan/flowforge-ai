export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: 'black'
        }}>
          FlowForge AI
        </h1>
        
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#666', 
          marginBottom: '2rem' 
        }}>
          Turn automation ideas into n8n workflows
        </p>
        
        <button style={{
          backgroundColor: 'black',
          color: 'white',
          border: 'none',
          padding: '12px 32px',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}>
          Start Chat
        </button>
      </div>
    </div>
  )
}
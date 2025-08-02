import { ReactNode } from 'react'

export const metadata = {
  title: 'FlowForge AI',
  description: 'Turn automation ideas into n8n workflows',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @keyframes pulse {
            0%, 70%, 100% { 
              transform: scale(1);
              opacity: 0.7;
            }
            35% { 
              transform: scale(1.3);
              opacity: 1;
            }
          }
        `}</style>
      </head>
      <body style={{ 
        margin: 0, 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: 'white',
        color: 'black'
      }}>
        {children}
      </body>
    </html>
  )
}
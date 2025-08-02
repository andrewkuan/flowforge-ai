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
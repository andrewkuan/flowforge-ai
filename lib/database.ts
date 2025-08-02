import Dexie, { Table } from 'dexie'

// Process step interface
export interface ProcessStep {
  id: string
  content: string
}

// Workflow state enum
export type WorkflowState = 
  | 'initial'                    // No process generated yet
  | 'process_generated'          // AI generated process steps
  | 'process_confirmed'          // User confirmed process steps
  | 'automation_generated'       // AI generated automation suggestions
  | 'workflow_generated'         // Final n8n workflow generated

// Database schema interfaces
export interface ChatSession {
  id?: number
  title: string
  createdAt: Date
  updatedAt: Date
  isActive: number // 1 for active, 0 for inactive (IndexedDB compatibility)
  processSteps?: ProcessStep[] // Persistent process steps for this session
  automationSuggestions?: string[] // Persistent automation suggestions for this session
  workflowState?: WorkflowState // Current state of the workflow progression
}

export interface ChatMessage {
  id?: number
  sessionId: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface WorkflowRecord {
  id?: number
  sessionId: number
  name: string
  description: string
  jsonContent: string
  workflowType?: 'deterministic' | 'ai-enhanced' | 'agentic'
  createdAt: Date
}

// Database class
export class FlowForgeDatabase extends Dexie {
  chatSessions!: Table<ChatSession>
  chatMessages!: Table<ChatMessage>
  workflows!: Table<WorkflowRecord>

  constructor() {
    super('FlowForgeAI')
    
    // Version 1 - Original schema
    this.version(1).stores({
      chatSessions: '++id, title, createdAt, updatedAt, isActive',
      chatMessages: '++id, sessionId, role, timestamp',
      workflows: '++id, sessionId, name, createdAt'
    })
    
    // Version 2 - Add processSteps and automationSuggestions to sessions
    this.version(2).stores({
      chatSessions: '++id, title, createdAt, updatedAt, isActive',
      chatMessages: '++id, sessionId, role, timestamp',
      workflows: '++id, sessionId, name, createdAt'
    })
  }

  // Session management
  async createSession(title: string = 'New Workflow'): Promise<number> {
    // Mark all other sessions as inactive
    await this.chatSessions.where('isActive').equals(1).modify({ isActive: 0 })
    
    // Create new active session
    const sessionId = await this.chatSessions.add({
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: 1
    })
    
    return sessionId
  }

  async getActiveSession(): Promise<ChatSession | undefined> {
    return await this.chatSessions.where('isActive').equals(1).first()
  }

  async getAllSessions(): Promise<ChatSession[]> {
    return await this.chatSessions.orderBy('updatedAt').reverse().toArray()
  }

  async updateSessionTitle(sessionId: number, title: string): Promise<void> {
    await this.chatSessions.update(sessionId, { 
      title, 
      updatedAt: new Date() 
    })
  }

  async setActiveSession(sessionId: number): Promise<void> {
    // Mark all sessions as inactive
    await this.chatSessions.where('isActive').equals(1).modify({ isActive: 0 })
    
    // Mark selected session as active
    await this.chatSessions.update(sessionId, { 
      isActive: 1,
      updatedAt: new Date()
    })
  }

  async updateSessionProcessSteps(sessionId: number, processSteps: ProcessStep[]): Promise<void> {
    await this.chatSessions.update(sessionId, { 
      processSteps,
      updatedAt: new Date()
    })
  }

  async updateSessionAutomationSuggestions(sessionId: number, automationSuggestions: string[]): Promise<void> {
    await this.chatSessions.update(sessionId, { 
      automationSuggestions,
      updatedAt: new Date()
    })
  }

  async updateSessionWorkflowState(sessionId: number, workflowState: WorkflowState): Promise<void> {
    await this.chatSessions.update(sessionId, { 
      workflowState,
      updatedAt: new Date()
    })
  }

  // Message management
  async addMessage(sessionId: number, role: 'user' | 'assistant', content: string): Promise<number> {
    const messageId = await this.chatMessages.add({
      sessionId,
      role,
      content,
      timestamp: new Date()
    })

    // Update session timestamp
    await this.chatSessions.update(sessionId, { updatedAt: new Date() })
    
    return messageId
  }

  async getSessionMessages(sessionId: number): Promise<ChatMessage[]> {
    return await this.chatMessages
      .where('sessionId')
      .equals(sessionId)
      .toArray()
  }

  async clearSessionMessages(sessionId: number): Promise<void> {
    await this.chatMessages.where('sessionId').equals(sessionId).delete()
  }

  // Workflow management
  async saveWorkflow(
    sessionId: number, 
    name: string, 
    description: string, 
    jsonContent: string,
    workflowType?: 'deterministic' | 'ai-enhanced' | 'agentic'
  ): Promise<number> {
    return await this.workflows.add({
      sessionId,
      name,
      description,
      jsonContent,
      workflowType,
      createdAt: new Date()
    })
  }

  async getSessionWorkflows(sessionId: number): Promise<WorkflowRecord[]> {
    const workflows = await this.workflows
      .where('sessionId')
      .equals(sessionId)
      .toArray()
    return workflows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async getAllWorkflows(): Promise<WorkflowRecord[]> {
    return await this.workflows.orderBy('createdAt').reverse().toArray()
  }

  // Utility methods
  async deleteSession(sessionId: number): Promise<void> {
    await this.transaction('rw', this.chatSessions, this.chatMessages, this.workflows, async () => {
      await this.chatMessages.where('sessionId').equals(sessionId).delete()
      await this.workflows.where('sessionId').equals(sessionId).delete()
      await this.chatSessions.delete(sessionId)
    })
  }

  async clearAllData(): Promise<void> {
    await this.transaction('rw', this.chatSessions, this.chatMessages, this.workflows, async () => {
      await this.chatMessages.clear()
      await this.workflows.clear()
      await this.chatSessions.clear()
    })
  }

  // Generate a smart title from the first user message
  generateSessionTitle(firstMessage: string): string {
    const cleaned = firstMessage.trim().slice(0, 50)
    if (cleaned.length < firstMessage.trim().length) {
      return cleaned + '...'
    }
    return cleaned || 'New Workflow'
  }
}

// Export singleton instance
export const db = new FlowForgeDatabase()
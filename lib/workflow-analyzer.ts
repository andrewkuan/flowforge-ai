export type WorkflowType = 'deterministic' | 'ai-enhanced' | 'agentic'

export interface WorkflowRecommendation {
  type: WorkflowType
  confidence: number // 0-100
  rationale: string[]
  examples: string[]
  tradeoffs: {
    pros: string[]
    cons: string[]
  }
  complexity: 'low' | 'medium' | 'high'
  estimatedSetupTime: string
}

export interface AnalysisFactors {
  hasDataProcessing: boolean
  hasDecisionMaking: boolean
  needsContextualUnderstanding: boolean
  requiresLearning: boolean
  hasComplexConditions: boolean
  involvesMultipleSteps: boolean
  needsHumanIntervention: boolean
  hasVariableInputs: boolean
  requiresRealTimeResponse: boolean
  involvesCreativeContent: boolean
  needsErrorRecovery: boolean
  hasExternalDependencies: boolean
}

export class WorkflowAnalyzer {
  
  /**
   * Analyzes user requirements and recommends workflow type
   */
  static analyzeWorkflow(description: string): WorkflowRecommendation {
    const factors = this.extractFactors(description)
    const scores = this.calculateTypeScores(factors)
    const recommendedType = this.selectBestType(scores)
    
    return this.buildRecommendation(recommendedType, scores, factors, description)
  }

  /**
   * Extract relevant factors from user description
   */
  private static extractFactors(description: string): AnalysisFactors {
    const text = description.toLowerCase()
    
    return {
      hasDataProcessing: this.containsPatterns(text, [
        'process data', 'analyze', 'extract', 'parse', 'filter', 
        'transform', 'clean data', 'aggregate', 'summarize'
      ]),
      
      hasDecisionMaking: this.containsPatterns(text, [
        'decide', 'choose', 'determine', 'if', 'based on', 'depending on',
        'condition', 'rule', 'criteria', 'evaluate', 'assess'
      ]),
      
      needsContextualUnderstanding: this.containsPatterns(text, [
        'understand', 'interpret', 'meaning', 'context', 'sentiment',
        'intent', 'natural language', 'conversation', 'tone'
      ]),
      
      requiresLearning: this.containsPatterns(text, [
        'learn', 'adapt', 'improve', 'pattern', 'trend', 'optimize',
        'machine learning', 'ai', 'intelligent', 'smart'
      ]),
      
      hasComplexConditions: this.containsPatterns(text, [
        'multiple conditions', 'complex logic', 'nested', 'various scenarios',
        'different cases', 'branching', 'many rules'
      ]),
      
      involvesMultipleSteps: this.containsPatterns(text, [
        'steps', 'sequence', 'then', 'after', 'workflow', 'process',
        'pipeline', 'chain', 'series'
      ]),
      
      needsHumanIntervention: this.containsPatterns(text, [
        'approval', 'review', 'human', 'manual', 'confirm', 'validate',
        'check', 'verify', 'oversight'
      ]),
      
      hasVariableInputs: this.containsPatterns(text, [
        'different types', 'various', 'dynamic', 'changing', 'flexible',
        'any format', 'multiple sources'
      ]),
      
      requiresRealTimeResponse: this.containsPatterns(text, [
        'real-time', 'instant', 'immediate', 'fast', 'quickly', 'urgent',
        'live', 'streaming'
      ]),
      
      involvesCreativeContent: this.containsPatterns(text, [
        'generate', 'create', 'write', 'compose', 'content', 'creative',
        'text', 'article', 'email', 'description'
      ]),
      
      needsErrorRecovery: this.containsPatterns(text, [
        'error', 'fail', 'retry', 'fallback', 'recovery', 'handle',
        'exception', 'robust'
      ]),
      
      hasExternalDependencies: this.containsPatterns(text, [
        'api', 'service', 'external', 'third party', 'integration',
        'webhook', 'database', 'system'
      ])
    }
  }

  /**
   * Check if text contains any of the given patterns
   */
  private static containsPatterns(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern))
  }

  /**
   * Calculate scores for each workflow type based on factors
   */
  private static calculateTypeScores(factors: AnalysisFactors): Record<WorkflowType, number> {
    let deterministicScore = 0
    let aiEnhancedScore = 0
    let agenticScore = 0

    // Deterministic scoring (simple, rule-based)
    if (!factors.needsContextualUnderstanding) deterministicScore += 20
    if (!factors.requiresLearning) deterministicScore += 20
    if (!factors.involvesCreativeContent) deterministicScore += 15
    if (factors.hasComplexConditions) deterministicScore += 10
    if (factors.involvesMultipleSteps) deterministicScore += 10
    if (!factors.hasVariableInputs) deterministicScore += 15
    if (factors.requiresRealTimeResponse) deterministicScore += 10

    // AI-enhanced scoring (AI for specific tasks)
    if (factors.hasDataProcessing) aiEnhancedScore += 15
    if (factors.needsContextualUnderstanding) aiEnhancedScore += 20
    if (factors.involvesCreativeContent) aiEnhancedScore += 20
    if (factors.hasVariableInputs) aiEnhancedScore += 15
    if (factors.hasDecisionMaking && !factors.requiresLearning) aiEnhancedScore += 10
    if (factors.involvesMultipleSteps) aiEnhancedScore += 10
    if (!factors.needsErrorRecovery) aiEnhancedScore += 10

    // Agentic scoring (autonomous, adaptive)
    if (factors.requiresLearning) agenticScore += 25
    if (factors.needsErrorRecovery) agenticScore += 20
    if (factors.hasVariableInputs) agenticScore += 15
    if (factors.hasComplexConditions) agenticScore += 15
    if (factors.needsContextualUnderstanding) agenticScore += 10
    if (factors.hasExternalDependencies) agenticScore += 10
    if (!factors.requiresRealTimeResponse) agenticScore += 5 // Agentic can be slower

    return {
      deterministic: Math.min(deterministicScore, 100),
      'ai-enhanced': Math.min(aiEnhancedScore, 100),
      agentic: Math.min(agenticScore, 100)
    }
  }

  /**
   * Select the best workflow type based on scores
   */
  private static selectBestType(scores: Record<WorkflowType, number>): WorkflowType {
    const entries = Object.entries(scores) as [WorkflowType, number][]
    const [bestType] = entries.reduce((a, b) => a[1] > b[1] ? a : b)
    return bestType
  }

  /**
   * Build complete recommendation with rationale
   */
  private static buildRecommendation(
    type: WorkflowType, 
    scores: Record<WorkflowType, number>,
    factors: AnalysisFactors,
    description: string
  ): WorkflowRecommendation {
    const confidence = scores[type]
    
    switch (type) {
      case 'deterministic':
        return {
          type,
          confidence,
          rationale: this.getDeterministicRationale(factors),
          examples: [
            'Simple data routing and filtering',
            'Rule-based email sorting and forwarding',
            'Scheduled report generation',
            'Basic form processing and notifications'
          ],
          tradeoffs: {
            pros: [
              'Fast and reliable execution',
              'Predictable behavior',
              'Easy to debug and maintain',
              'Low resource requirements'
            ],
            cons: [
              'Limited flexibility',
              'Cannot handle unexpected inputs well',
              'No learning or adaptation capabilities'
            ]
          },
          complexity: 'low',
          estimatedSetupTime: '30 minutes - 2 hours'
        }

      case 'ai-enhanced':
        return {
          type,
          confidence,
          rationale: this.getAiEnhancedRationale(factors),
          examples: [
            'Smart email categorization and responses',
            'Content generation with data inputs',
            'Intelligent data extraction and processing',
            'Context-aware decision making'
          ],
          tradeoffs: {
            pros: [
              'Handles variable inputs intelligently',
              'Can understand context and nuance',
              'Good balance of automation and intelligence',
              'Relatively predictable costs'
            ],
            cons: [
              'Requires AI service integration',
              'Slightly slower than pure deterministic',
              'May need prompt engineering'
            ]
          },
          complexity: 'medium',
          estimatedSetupTime: '2-6 hours'
        }

      case 'agentic':
        return {
          type,
          confidence,
          rationale: this.getAgenticRationale(factors),
          examples: [
            'Autonomous customer service agents',
            'Self-optimizing business processes',
            'Adaptive content creation workflows',
            'Intelligent system monitoring and response'
          ],
          tradeoffs: {
            pros: [
              'Fully autonomous operation',
              'Learns and improves over time',
              'Handles complex, changing scenarios',
              'Can recover from errors independently'
            ],
            cons: [
              'More complex to set up and monitor',
              'Higher resource requirements',
              'Less predictable behavior',
              'Requires careful guardrails'
            ]
          },
          complexity: 'high',
          estimatedSetupTime: '1-3 days'
        }
    }
  }

  private static getDeterministicRationale(factors: AnalysisFactors): string[] {
    const rationale: string[] = []
    
    if (!factors.needsContextualUnderstanding) {
      rationale.push('No complex language understanding required')
    }
    if (!factors.requiresLearning) {
      rationale.push('Fixed rules and logic are sufficient')
    }
    if (factors.requiresRealTimeResponse) {
      rationale.push('Fast, predictable response times needed')
    }
    if (!factors.hasVariableInputs) {
      rationale.push('Consistent input format expected')
    }
    
    return rationale
  }

  private static getAiEnhancedRationale(factors: AnalysisFactors): string[] {
    const rationale: string[] = []
    
    if (factors.needsContextualUnderstanding) {
      rationale.push('Requires understanding of natural language or context')
    }
    if (factors.involvesCreativeContent) {
      rationale.push('Benefits from AI content generation capabilities')
    }
    if (factors.hasDataProcessing) {
      rationale.push('Can leverage AI for intelligent data processing')
    }
    if (factors.hasVariableInputs) {
      rationale.push('AI can handle diverse input formats effectively')
    }
    
    return rationale
  }

  private static getAgenticRationale(factors: AnalysisFactors): string[] {
    const rationale: string[] = []
    
    if (factors.requiresLearning) {
      rationale.push('Needs to learn and adapt from experience')
    }
    if (factors.needsErrorRecovery) {
      rationale.push('Requires autonomous error handling and recovery')
    }
    if (factors.hasComplexConditions) {
      rationale.push('Complex decision-making that benefits from AI reasoning')
    }
    if (factors.hasExternalDependencies) {
      rationale.push('Can autonomously manage external service interactions')
    }
    
    return rationale
  }
}
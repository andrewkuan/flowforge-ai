# FlowForge AI

A minimalist web chat assistant that deeply understands automation problems, creates visual flowcharts for alignment verification, and generates downloadable n8n JSON workflows.

## 🎯 Flowchart-First Approach

FlowForge AI now follows a thoughtful, validation-driven process:

1. **Deep Problem Discovery** - Comprehensive clarifying questions
2. **Visual Process Mapping** - Interactive Mermaid flowcharts  
3. **User Validation** - Iterative refinement until perfect alignment
4. **Smart Recommendations** - AI suggests optimal workflow type
5. **n8n Generation** - Technical implementation only after approval

## ✨ Features

- 💬 **Streaming chat interface** with Anthropic Claude
- 📊 **Interactive flowchart generation** using Mermaid.js
- 🎯 **Workflow type recommendations** (deterministic, AI-enhanced, agentic)
- 📱 **Responsive design** with clean monochrome UI
- 💾 **Local persistence** with IndexedDB (session history)
- 📥 **Download options** for both flowcharts and n8n JSON
- 🔄 **Iterative refinement** until perfect problem-solution alignment

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

## 📋 Benefits

- **Prevents misalignment** between user expectations and final workflow
- **Reduces rework** by validating understanding before implementation  
- **Improves process documentation** with visual flowcharts
- **Builds user confidence** through transparent, step-by-step approach
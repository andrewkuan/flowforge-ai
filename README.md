# FlowForge AI

A minimalist web chat assistant that deeply understands automation problems, creates visual flowcharts for alignment verification, and generates downloadable n8n JSON workflows.

## 🎯 Problem-First Approach

FlowForge AI follows a thorough, problem-understanding process before any solutions:

1. **Continuous Problem Exploration** - Relentless questioning to understand complete context
2. **Multi-layered Discovery** - Current state, pain points, constraints, stakeholders
3. **Problem Validation** - AI summarizes understanding and confirms accuracy
4. **Visual Process Mapping** - Interactive Mermaid flowcharts of current state
5. **User Validation** - Iterative refinement until perfect alignment
6. **Smart Recommendations** - AI suggests optimal workflow type
7. **n8n Generation** - Technical implementation only after complete understanding

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

- **Eliminates solution assumptions** by thoroughly understanding problems first
- **Prevents costly misalignment** between user expectations and final workflow
- **Reduces rework** by validating understanding before any technical implementation
- **Improves process documentation** with comprehensive visual flowcharts
- **Builds user confidence** through transparent, systematic discovery approach
- **Uncovers hidden requirements** through persistent, intelligent questioning
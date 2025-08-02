# FlowForge AI

A conversational AI assistant that instantly transforms your automation problems into structured n8n workflows. Describe your process, refine it in an interactive sidebar, get automation suggestions, and generate ready-to-use n8n JSON workflows.

## 🎯 Streamlined Process-to-Automation Workflow

FlowForge AI uses an intelligent 3-phase approach:

1. **🤖 Instant Process Analysis** - AI immediately infers your current process from problem descriptions
2. **✏️ Interactive Process Refinement** - Edit and perfect process steps in a dedicated sidebar panel  
3. **⚡ Smart Automation Suggestions** - AI identifies automation opportunities with specific n8n nodes
4. **🚀 n8n Workflow Generation** - Complete JSON workflows ready for import

## ✨ Key Features

### 🎯 **Smart Process Generation**
- **Immediate inference** of process steps from problem descriptions
- **No lengthy questioning** - AI makes intelligent assumptions
- **Interactive editing** with real-time persistence

### 📋 **Editable Sidebar Panels**
- **Process Panel** - Edit, add, remove, and reorder workflow steps
- **Automation Panel** - Review AI-suggested automation opportunities
- **Persistent state** - Your progress is saved across sessions

### 🔄 **Workflow State Tracking**
- **Intelligent session management** - Return to exactly where you left off
- **State-aware UI** - Buttons and panels adapt to your progress
- **No duplicate requests** - System remembers completed steps

### 💾 **Advanced Persistence**
- **Session history** with IndexedDB storage
- **Process steps** and automation suggestions saved permanently
- **Workflow state** tracking across browser sessions
- **Session switching** without losing progress

### 🚀 **n8n Integration**
- **Proper n8n JSON format** for direct import
- **Download and copy** functionality for workflows
- **Node-specific suggestions** (HTTP Request, Email, Schedule, etc.)
- **Ready-to-use** workflows with proper connections

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

## 📋 User Experience

### **Conversational Start**
```
User: "I need to automate exporting receipt emails to my accountant"

AI immediately responds with:
**Current Process:**
1. Check email inbox regularly for new receipt emails from vendors
2. Identify the emails containing receipts that need to be exported  
3. Open each receipt email individually
4. Locate the receipt attachment or relevant details within the email body
5. Copy or download the receipt file
6. Create a new email to your accountant
7. Attach the receipt file and include any necessary details in the email body
8. Send the email to your accountant
9. Repeat this process for each receipt email that needs to be forwarded

Does this capture the process accurately? Let me know if I'm missing anything.
```

### **Interactive Refinement**
- Process steps appear in **editable sidebar**
- **Click any step** to edit text
- **Add/remove steps** with + and × buttons  
- **Changes auto-saved** to database
- **Progress persists** across sessions

### **Smart Automation**
- Click **"✅ Process is Accurate"** 
- AI analyzes process and suggests **specific automation points**
- **Automation panel** shows n8n node recommendations
- **Explanations** for why each step should be automated

### **Ready Workflows**
- Click **"🚀 Generate n8n Workflow"**
- Complete **n8n JSON** generated instantly
- **Download or copy** for direct import
- **Proper formatting** for seamless n8n integration

## 🎯 Benefits

- **⚡ Instant process generation** - No lengthy conversations required
- **✏️ Full editing control** - Refine AI suggestions to match your exact needs  
- **💾 Never lose progress** - All work persists across browser sessions
- **🎯 Targeted automation** - AI identifies the best automation opportunities
- **🚀 Production ready** - Generate workflows you can immediately deploy
- **📱 Intuitive interface** - Clean, focused design for maximum productivity
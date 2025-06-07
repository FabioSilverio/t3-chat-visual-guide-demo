# Visual Guide Test Environment

A test environment for demonstrating the **Visual Guide** feature for chat navigation - designed to help users navigate through their conversation history with AI models.

## 🚀 Features

### Visual Guide Panel
- **Interactive Timeline**: Visual representation of conversation flow with clickable navigation
- **Multi-Session Support**: Switch between different chat sessions with various AI models
- **Message Preview**: Truncated preview of messages with timestamps
- **Session Analytics**: View session details (start time, message count, model used)
- **Smooth Navigation**: Click any message in the guide to jump to it in the main chat

### Modern UI/UX
- **Collapsible Sidebar**: Toggle the visual guide on/off
- **Responsive Design**: Works on various screen sizes
- **Smooth Animations**: Professional transitions and highlight effects
- **Color-Coded Messages**: Visual distinction between user and AI messages
- **Timeline Visualization**: Connected timeline showing conversation flow

## 🎯 Purpose

This test environment was created to demonstrate the Visual Guide feature concept for **T3 Chat**, allowing users to:
- Navigate long conversations efficiently
- Jump to specific parts of their chat history
- Get an overview of conversation flow
- Switch between different chat sessions seamlessly

## 🛠️ Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Modern React Hooks** - useState, useRef, useEffect for state management

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd visual-guide-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use the Demo

1. **Toggle Visual Guide**: Click the arrow button in the header to show/hide the visual guide panel
2. **Switch Sessions**: Use the dropdown in the guide to switch between different chat sessions
3. **Navigate Messages**: Click any message in the timeline to jump to it in the main chat
4. **View Session Info**: Check the bottom of the guide panel for session statistics

## 📊 Demo Data

The demo includes pre-loaded conversation sessions:
- **JavaScript Best Practices** (GPT-4) - Discussion about modern JS development
- **React Performance Tips** (Claude) - Optimization strategies for React apps

## 🎨 Design Philosophy

The Visual Guide is designed with these principles:
- **Non-intrusive**: Doesn't interfere with the main chat experience
- **Contextual**: Provides relevant information at the right time
- **Efficient**: Enables quick navigation through long conversations
- **Visual**: Uses timeline metaphors that users understand intuitively

## 🚀 Production Considerations

For integration into T3 Chat:
- Session data would come from your backend/database
- Real-time updates as new messages arrive
- User preferences for guide visibility
- Keyboard shortcuts for power users
- Mobile-optimized interactions

## 🤝 Contributing

This is a demo/test environment. For production integration:
1. Adapt the data structures to match your existing chat system
2. Integrate with your state management solution
3. Add real-time message updates
4. Implement user preferences and settings

## 📝 License

This is a demonstration project created for testing the Visual Guide concept.

---

**Built for T3 Chat team demonstration** 🎯

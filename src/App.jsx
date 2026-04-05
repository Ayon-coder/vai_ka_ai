import { useState, useRef, useCallback } from 'react';
import { sendChat } from './api';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import OnboardingModal from './components/OnboardingModal';
import './App.css';

const MODE_CONTENT = {
  deep_dive: {
    description: 'Advanced search for IEEE.org technical research, standards, and global engineering trends.',
    suggestions: [
      'Explain the IEEE 802.11 standard',
      'How does IEEE 754 floating point work?',
      'What is the latest in 6G research?',
    ],
  },
  student_branch: {
    description: 'Your local assistant for IEEE Student Branch events, membership, and branch activities.',
    suggestions: [
      'Who are our current committee members?',
      'What events are scheduled for this month?',
      'How can I join the Student Branch?',
    ],
  },
};

function App() {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [mode, setMode] = useState('deep_dive');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showGuideTooltip, setShowGuideTooltip] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const chatWrapperRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (chatWrapperRef.current) {
      chatWrapperRef.current.scrollTo({
        top: chatWrapperRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    setShowWelcome(false);

    // Add user message to display
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    // Add to chat history for API
    const newHistory = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(newHistory);

    setIsTyping(true);
    setTimeout(scrollToBottom, 50);

    try {
      const data = await sendChat(newHistory, mode);

      if (data.choices && data.choices[0]) {
        const assistantContent = data.choices[0].message.content;
        const sources = data.sources || [];
        const assistantMsg = {
          role: 'assistant',
          content: assistantContent,
          sources,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setChatHistory((prev) => [
          ...prev,
          { role: 'assistant', content: assistantContent },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            sources: [],
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Technical error: Could not connect to the server.',
          sources: [],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 50);
    }
  }, [chatHistory, mode, scrollToBottom]);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setMessages([]);
    setChatHistory([]);
    setShowWelcome(true);
  }, []);

  const handleOnboardingDismiss = useCallback(() => {
    setShowOnboarding(false);
    setIsReady(true);
    setShowGuideTooltip(true);
  }, []);

  const handleGuideTooltipDismiss = useCallback(() => {
    setShowGuideTooltip(false);
  }, []);

  const currentModeContent = MODE_CONTENT[mode] || MODE_CONTENT.deep_dive;

  return (
    <>
      <div className="app-background">
        <div className="glow-circle top-left"></div>
        <div className="glow-circle bottom-right"></div>
      </div>

      <div className="app-container">
        <Header
          mode={mode}
          onModeChange={handleModeChange}
          showGuideTooltip={showGuideTooltip}
          onGuideTooltipDismiss={handleGuideTooltipDismiss}
        />

        <ChatArea
          ref={chatWrapperRef}
          messages={messages}
          isTyping={isTyping}
          showWelcome={showWelcome}
          modeContent={currentModeContent}
          onSuggestionClick={handleSendMessage}
          mode={mode}
          isReady={isReady}
        />

        <InputArea onSend={handleSendMessage} disabled={!isReady} />
      </div>

      {showOnboarding && (
        <OnboardingModal onDismiss={handleOnboardingDismiss} />
      )}
    </>
  );
}

export default App;

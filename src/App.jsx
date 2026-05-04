import { useState, useRef, useCallback, useEffect } from 'react';
import { sendChat } from './api';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import OnboardingModal from './components/OnboardingModal';
import './App.css';

const MODE_CONTENT = {
  deep_dive: {
    description: 'Technical research, IEEE standards, and global engineering trends.',
    suggestions: [
      'Explain IEEE 802.11 standard',
      'Latest trends in 6G research',
      'IEEE 754 floating point guide',
    ],
  },
  student_branch: {
    description: 'IEEE Student Branch events, membership, and activities.',
    suggestions: [
      'Upcoming branch events',
      'Current committee members',
      'Membership benefits',
    ],
  },
};

// ── Strike / Ban helpers (localStorage) ─────────────────────────────────────
const STRIKE_KEY = 'vai_strikes';
const BAN_KEY = 'vai_ban_until';
const MAX_STRIKES = 3;
const BAN_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function getStrikes() {
  return parseInt(localStorage.getItem(STRIKE_KEY) || '0', 10);
}
function setStrikes(n) {
  localStorage.setItem(STRIKE_KEY, String(n));
}
function getBanUntil() {
  return parseInt(localStorage.getItem(BAN_KEY) || '0', 10);
}
function setBan() {
  localStorage.setItem(BAN_KEY, String(Date.now() + BAN_DURATION_MS));
  setStrikes(0); // reset strikes after ban is set
}
function clearBan() {
  localStorage.removeItem(BAN_KEY);
  setStrikes(0);
}
function isBanned() {
  const until = getBanUntil();
  if (!until) return false;
  if (Date.now() >= until) {
    clearBan();
    return false;
  }
  return true;
}
function banRemainingMinutes() {
  const until = getBanUntil();
  if (!until) return 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 60000));
}

function App() {
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [mode, setMode] = useState('deep_dive');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showGuideTooltip, setShowGuideTooltip] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [banned, setBanned] = useState(isBanned());
  const [banMins, setBanMins] = useState(banRemainingMinutes());
  const chatWrapperRef = useRef(null);

  // Live countdown — ticks every second while banned
  useEffect(() => {
    if (!banned) return;
    const timer = setInterval(() => {
      if (!isBanned()) {
        setBanned(false);
        setBanMins(0);
        clearInterval(timer);
      } else {
        setBanMins(banRemainingMinutes());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [banned]);

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

    // ── Ban check ──
    if (isBanned()) {
      setBanned(true);
      const mins = banRemainingMinutes();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `🚫 You're temporarily on cooldown for ${mins} more minute${mins !== 1 ? 's' : ''}. Please come back later!`,
          sources: [],
          timestamp: new Date(),
        },
      ]);
      return;
    }

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

      // ── Watcher warning handler ──
      if (data.is_warning) {
        const currentStrikes = getStrikes() + 1;
        setStrikes(currentStrikes);

        let warningContent;
        if (currentStrikes >= MAX_STRIKES) {
          setBan();
          setBanned(true);
          warningContent = `🚫 Too many nonsense messages. You've been put on a 30-minute cooldown. Please use this time wisely!`;
        } else {
          warningContent = `⚠️ Warning ${currentStrikes}/${MAX_STRIKES}: Please send meaningful messages. ${MAX_STRIKES - currentStrikes} more warning${MAX_STRIKES - currentStrikes !== 1 ? 's' : ''} before a temporary cooldown.`;
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: warningContent,
            sources: [],
            timestamp: new Date(),
          },
        ]);
        // Don't add warning to chat history
        return;
      }

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

        {banned && (
          <div className="ban-banner">
            <div className="ban-banner-icon">🚫</div>
            <div className="ban-banner-text">
              <strong>You've been temporarily blocked</strong>
              <span>Too many inappropriate messages. Try again in <b>{banMins}</b> minute{banMins !== 1 ? 's' : ''}.</span>
            </div>
          </div>
        )}

        <InputArea onSend={handleSendMessage} disabled={!isReady || banned} />
      </div>

      {showOnboarding && (
        <OnboardingModal onDismiss={handleOnboardingDismiss} />
      )}
    </>
  );
}

export default App;

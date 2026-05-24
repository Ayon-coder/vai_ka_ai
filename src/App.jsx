import { useState, useRef, useCallback, useEffect } from 'react';
import { sendChat } from './api';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import OnboardingModal from './components/OnboardingModal';
import './App.css';

const MODE_CONTENT = {
  deep_dive: {
    label: 'Deep Dive',
    code: 'DD-01',
    description: 'Technical research, IEEE standards, and global engineering trends.',
    suggestions: [
      'Explain IEEE 802.11 standard',
      'Latest trends in 6G research',
      'IEEE 754 floating point guide',
    ],
  },
  student_branch: {
    label: 'Student Branch',
    code: 'SB-02',
    description: 'IEEE Student Branch events, membership, and activities.',
    suggestions: [
      'Upcoming branch events',
      'Current committee members',
      'Membership benefits',
    ],
  },
};

const STRIKE_KEY = 'vai_strikes';
const BAN_KEY = 'vai_ban_until';
const MAX_STRIKES = 3;
const BAN_DURATION_MS = 30 * 60 * 1000;

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
  setStrikes(0);
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
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const chatWrapperRef = useRef(null);

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

  useEffect(() => {
    const handleMove = (e) => {
      setCursorPos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatWrapperRef.current) {
      chatWrapperRef.current.scrollTo({
        top: chatWrapperRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

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

    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    const newHistory = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(newHistory);

    setIsTyping(true);

    try {
      const data = await sendChat(newHistory, mode);

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
    }
  }, [chatHistory, mode]);

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
      <div
        className="bg"
        style={{
          '--mx': `${cursorPos.x}%`,
          '--my': `${cursorPos.y}%`,
        }}
        aria-hidden="true"
      >
        <div className="bg__grid"></div>
        <div className="bg__noise"></div>
        <div className="bg__glow"></div>
        <div className="bg__scan"></div>
      </div>

      <div className="shell">
        <Header
          mode={mode}
          modes={MODE_CONTENT}
          onModeChange={handleModeChange}
          showGuideTooltip={showGuideTooltip}
          onGuideTooltipDismiss={handleGuideTooltipDismiss}
        />

        <div className="statusbar" aria-hidden="true">
          <div className="statusbar__group">
            <span className="statusbar__label">SYS</span>
            <span className="statusbar__value">VAI.CORE</span>
          </div>
          <div className="statusbar__group">
            <span className="statusbar__label">CHAN</span>
            <span className="statusbar__value">{currentModeContent.code}</span>
          </div>
          <div className="statusbar__group statusbar__group--grow">
            <span className="statusbar__bar"></span>
          </div>
          <div className="statusbar__group">
            <span className="statusbar__label">STATE</span>
            <span className={`statusbar__value ${isTyping ? 'statusbar__value--active' : ''}`}>
              {!isReady ? 'BOOT' : banned ? 'LOCKED' : isTyping ? 'PROCESSING' : 'READY'}
            </span>
          </div>
        </div>

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
          <div className="ban">
            <div className="ban__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <div className="ban__text">
              <strong>SESSION LOCKED</strong>
              <span>Cooldown: <b>{banMins}</b> min{banMins !== 1 ? 's' : ''} remaining</span>
            </div>
          </div>
        )}

        <InputArea
          onSend={handleSendMessage}
          disabled={!isReady || banned || isTyping}
          placeholder={
            !isReady ? 'Initializing system...' :
            banned ? 'Session locked...' :
            isTyping ? 'Vai is thinking...' :
            'Transmit message to Vai...'
          }
          modeCode={currentModeContent.code}
        />
      </div>

      {showOnboarding && (
        <OnboardingModal onDismiss={handleOnboardingDismiss} />
      )}
    </>
  );
}

export default App;

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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

const STRIKE_KEY = 'ieee_assistant_strikes';
const BAN_KEY = 'ieee_assistant_ban_until';
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
  const [isReady, setIsReady] = useState(false);
  const [banned, setBanned] = useState(isBanned());
  const [banMins, setBanMins] = useState(banRemainingMinutes());
  const chatWrapperRef = useRef(null);
  const bgRef = useRef(null);

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
    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;

    const apply = () => {
      raf = 0;
      const el = bgRef.current;
      if (!el) return;
      el.style.setProperty('--mx', `${pendingX}px`);
      el.style.setProperty('--my', `${pendingY}px`);
    };

    const handleMove = (e) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
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
  }, []);

  const currentModeContent = useMemo(
    () => MODE_CONTENT[mode] || MODE_CONTENT.deep_dive,
    [mode]
  );

  return (
    <>
      <div className="bg" ref={bgRef} aria-hidden="true">
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
        />

        <div className="statusbar">
          <div className="statusbar__group">
            <span className="statusbar__label">SYS</span>
            <span className="statusbar__value">IEEE.ASSISTANT</span>
          </div>
          <div className="statusbar__group">
            <span className="statusbar__label">CHAN</span>
            <span className="statusbar__value">{currentModeContent.code}</span>
          </div>
          <div className="statusbar__group statusbar__group--grow">
            <span className="statusbar__bar"></span>
          </div>
          <div className="statusbar__group">
            <div className="modepill" role="tablist" aria-label="Select mode">
              {Object.keys(MODE_CONTENT).map((k) => {
                const m = MODE_CONTENT[k];
                const active = mode === k;
                return (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={active}
                    title={m.label}
                    className={`modepill__btn ${active ? 'is-active' : ''}`}
                    onClick={() => !active && handleModeChange(k)}
                  >
                    {m.code}
                  </button>
                );
              })}
            </div>
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
            isTyping ? 'IEEE Assistant is thinking...' :
            'Transmit message to IEEE Assistant...'
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

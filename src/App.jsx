import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { streamChat } from './api';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import OnboardingModal from './components/OnboardingModal';
import ModeTutorialBanner from './components/ModeTutorialBanner';
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
  const [messagesByMode, setMessagesByMode] = useState({
    deep_dive: [],
    student_branch: [],
  });
  const [chatHistoryByMode, setChatHistoryByMode] = useState({
    deep_dive: [],
    student_branch: [],
  });
  const [typingByMode, setTypingByMode] = useState({
    deep_dive: false,
    student_branch: false,
  });
  const [mode, setMode] = useState('deep_dive');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showModeTutorial, setShowModeTutorial] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [banned, setBanned] = useState(isBanned());
  const [banMins, setBanMins] = useState(banRemainingMinutes());
  const chatWrapperRef = useRef(null);
  const bgRef = useRef(null);

  const currentMessages = messagesByMode[mode] || [];
  const isTyping = !!typingByMode[mode];

  const handleDismissTutorial = useCallback(() => {
    setShowModeTutorial(false);
  }, []);

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
  }, [mode, currentMessages, isTyping, scrollToBottom]);

  const abortRef = useRef(null);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const targetMode = mode;

    if (isBanned()) {
      setBanned(true);
      const mins = banRemainingMinutes();
      const banMsg = {
        role: 'assistant',
        content: `🚫 You're temporarily on cooldown for ${mins} more minute${mins !== 1 ? 's' : ''}. Please come back later!`,
        sources: [],
        timestamp: new Date(),
      };
      setMessagesByMode((prev) => ({
        ...prev,
        [targetMode]: [...(prev[targetMode] || []), banMsg],
      }));
      return;
    }

    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessagesByMode((prev) => ({
      ...prev,
      [targetMode]: [...(prev[targetMode] || []), userMsg],
    }));

    const existingHistory = chatHistoryByMode[targetMode] || [];
    const newHistory = [...existingHistory, { role: 'user', content: text }];
    setChatHistoryByMode((prev) => ({
      ...prev,
      [targetMode]: newHistory,
    }));

    // Show the loading animation (5 steps in Deep Dive, 3 dots in Student Branch)
    setTypingByMode((prev) => ({ ...prev, [targetMode]: true }));

    let accumulatedContent = '';
    let streamMeta = null;
    let hasStartedStreaming = false;
    const doneCalledRef = { current: false };

    const abort = streamChat(newHistory, targetMode, {
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        const currentContent = accumulatedContent;

        if (!hasStartedStreaming) {
          hasStartedStreaming = true;
          // Hide loading animation once tokens start streaming
          setTypingByMode((prev) => ({ ...prev, [targetMode]: false }));
          // Add the assistant message bubble for streaming
          setMessagesByMode((prev) => ({
            ...prev,
            [targetMode]: [
              ...(prev[targetMode] || []),
              {
                role: 'assistant',
                content: currentContent,
                sources: [],
                timestamp: new Date(),
                isStreaming: true,
              },
            ],
          }));
        } else {
          // Progressively update the streaming message
          setMessagesByMode((prev) => {
            const msgs = [...(prev[targetMode] || [])];
            const lastIdx = msgs.length - 1;
            if (lastIdx >= 0 && msgs[lastIdx].isStreaming) {
              msgs[lastIdx] = { ...msgs[lastIdx], content: currentContent };
            }
            return { ...prev, [targetMode]: msgs };
          });
        }
      },

      onMeta: (meta) => {
        streamMeta = meta;
      },

      onDone: () => {
        if (doneCalledRef.current) return;
        doneCalledRef.current = true;

        setTypingByMode((prev) => ({ ...prev, [targetMode]: false }));

        const finalContent = accumulatedContent;
        const sources = streamMeta?.sources || [];
        const isWarning = streamMeta?.is_warning || false;
        const isRejected = streamMeta?.is_rejected || false;

        // Handle warning (strike escalation)
        if (isWarning) {
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

          if (hasStartedStreaming) {
            setMessagesByMode((prev) => {
              const msgs = [...(prev[targetMode] || [])];
              const lastIdx = msgs.length - 1;
              if (lastIdx >= 0 && msgs[lastIdx].isStreaming) {
                msgs[lastIdx] = {
                  role: 'assistant',
                  content: warningContent,
                  sources: [],
                  timestamp: new Date(),
                  isStreaming: false,
                };
              }
              return { ...prev, [targetMode]: msgs };
            });
          } else {
            setMessagesByMode((prev) => ({
              ...prev,
              [targetMode]: [
                ...(prev[targetMode] || []),
                {
                  role: 'assistant',
                  content: warningContent,
                  sources: [],
                  timestamp: new Date(),
                  isStreaming: false,
                },
              ],
            }));
          }
          return;
        }

        // Finalize the message
        if (hasStartedStreaming) {
          setMessagesByMode((prev) => {
            const msgs = [...(prev[targetMode] || [])];
            const lastIdx = msgs.length - 1;
            if (lastIdx >= 0 && msgs[lastIdx].isStreaming) {
              msgs[lastIdx] = {
                role: 'assistant',
                content: finalContent || 'Sorry, I encountered an error. Please try again.',
                sources,
                timestamp: new Date(),
                isStreaming: false,
              };
            }
            return { ...prev, [targetMode]: msgs };
          });
        } else {
          setMessagesByMode((prev) => ({
            ...prev,
            [targetMode]: [
              ...(prev[targetMode] || []),
              {
                role: 'assistant',
                content: finalContent || 'Sorry, I encountered an error. Please try again.',
                sources,
                timestamp: new Date(),
                isStreaming: false,
              },
            ],
          }));
        }

        // Add to chat history
        if (finalContent && !isRejected) {
          setChatHistoryByMode((prev) => ({
            ...prev,
            [targetMode]: [
              ...(prev[targetMode] || []),
              { role: 'assistant', content: finalContent },
            ],
          }));
        }
      },

      onError: (err) => {
        console.error('Stream error:', err);
        setTypingByMode((prev) => ({ ...prev, [targetMode]: false }));

        const errFallback = {
          role: 'assistant',
          content: 'Technical error: Could not connect to the server.',
          sources: [],
          timestamp: new Date(),
          isStreaming: false,
        };

        if (hasStartedStreaming) {
          setMessagesByMode((prev) => {
            const msgs = [...(prev[targetMode] || [])];
            const lastIdx = msgs.length - 1;
            if (lastIdx >= 0 && msgs[lastIdx].isStreaming) {
              msgs[lastIdx] = errFallback;
            }
            return { ...prev, [targetMode]: msgs };
          });
        } else {
          setMessagesByMode((prev) => ({
            ...prev,
            [targetMode]: [...(prev[targetMode] || []), errFallback],
          }));
        }
      },
    });

    abortRef.current = abort;
  }, [chatHistoryByMode, mode]);

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  const handleClearChat = useCallback((modeToClear) => {
    const target = modeToClear || mode;
    setMessagesByMode((prev) => ({
      ...prev,
      [target]: [],
    }));
    setChatHistoryByMode((prev) => ({
      ...prev,
      [target]: [],
    }));
  }, [mode]);

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
                    id={`mode-btn-${k}`}
                    role="tab"
                    aria-selected={active}
                    title={`${m.label}: ${m.description}`}
                    className={`modepill__btn ${active ? 'is-active' : ''}`}
                    onClick={() => !active && handleModeChange(k)}
                  >
                    <span className="modepill__icon" aria-hidden="true">{k === 'deep_dive' ? '🔬' : '🏛️'}</span>
                    <span className="modepill__label">{m.label}</span>
                    <span className="modepill__code">({m.code})</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              id="mode-guide-toggle-btn"
              className={`modepill__help ${showModeTutorial ? 'is-active' : ''}`}
              title="Channel Guide · Why are there two buttons?"
              onClick={() => setShowModeTutorial((prev) => !prev)}
              aria-expanded={showModeTutorial}
            >
              <span className="modepill__help-icon" aria-hidden="true">?</span>
              <span className="modepill__help-text">Guide</span>
            </button>
          </div>
          <div className="statusbar__group">
            <span className="statusbar__label">STATE</span>
            <span className={`statusbar__value ${isTyping ? 'statusbar__value--active' : ''}`}>
              {!isReady ? 'BOOT' : banned ? 'LOCKED' : isTyping ? 'PROCESSING' : 'READY'}
            </span>
          </div>
        </div>

        {showModeTutorial && (
          <ModeTutorialBanner
            activeMode={mode}
            onModeSelect={handleModeChange}
            onDismiss={handleDismissTutorial}
          />
        )}

        <ChatArea
          ref={chatWrapperRef}
          messages={currentMessages}
          isTyping={isTyping}
          showWelcome={currentMessages.length === 0}
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
          onClearChat={handleClearChat}
          messagesCount={currentMessages.length}
        />
      </div>

      {showOnboarding && (
        <OnboardingModal onDismiss={handleOnboardingDismiss} />
      )}
    </>
  );
}

export default App;

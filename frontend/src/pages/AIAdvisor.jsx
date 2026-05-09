import { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowUpLong, FaRobot, FaUser } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { getAdvice, getHistory } from '../services/aiService';

const suggestedPrompts = [
  'How can I grow my savings rate by 10% in 90 days?',
  'Review my spending behavior and suggest corrections.',
  'What is the safest allocation for moderate risk?',
];

function Bubble({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span
          className="radius-circle flex h-10 w-10 items-center justify-center"
          style={{
            border: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--orbit) 14%, var(--lifted-surface))',
            color: 'var(--signal)',
          }}
        >
          <FaRobot />
        </span>
      )}

      <div
        className="px-5 py-3.5 text-sm leading-relaxed"
        style={{
          maxWidth: 'min(78%, 700px)',
          border: `1px solid ${isUser ? 'transparent' : 'var(--border)'}`,
          borderRadius: 'var(--radius-stadium)',
          borderTopRightRadius: isUser ? '0' : 'var(--radius-stadium)',
          borderTopLeftRadius: isUser ? 'var(--radius-stadium)' : '0',
          background: isUser ? 'var(--ink)' : 'var(--lifted-surface)',
          color: isUser ? 'var(--canvas)' : 'var(--ink)',
        }}
      >
        {content}
      </div>

      {isUser && (
        <span
          className="radius-circle flex h-10 w-10 items-center justify-center"
          style={{
            border: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--growth) 14%, var(--lifted-surface))',
            color: 'var(--growth)',
          }}
        >
          <FaUser />
        </span>
      )}
    </div>
  );
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getHistory();
        const history = response?.data?.data || [];
        const flatMessages = history.flatMap((chat) => [
          { role: 'user', content: chat.message },
          { role: 'ai', content: chat.response },
        ]);
        setMessages(flatMessages);
      } catch {
        toast.error('Unable to load advisor history.');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const chatMessages = useMemo(() => {
    if (messages.length > 0) {
      return messages;
    }

    return [
      {
        role: 'ai',
        content:
          'Strategic Advisor online. Share your current goal and I will map a focused, risk-aware wealth plan.',
      },
    ];
  }, [messages]);

  const handleSend = async (overrideText) => {
    const outgoing = (overrideText || input).trim();
    if (!outgoing || sending) {
      return;
    }

    setInput('');
    setMessages((current) => [...current, { role: 'user', content: outgoing }]);
    setSending(true);

    try {
      const response = await getAdvice(outgoing);
      const aiReply = response?.data?.data?.response || 'I need a little more context to advise accurately.';
      setMessages((current) => [...current, { role: 'ai', content: aiReply }]);
    } catch {
      toast.error('Advisor service unavailable right now.');
      setMessages((current) => [
        ...current,
        { role: 'ai', content: 'I could not process that request right now. Please try again shortly.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-7 md:space-y-8">
      <section className="card-stadium fade-in-up p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span
            className="radius-circle flex h-12 w-12 items-center justify-center"
            style={{
              background: 'color-mix(in srgb, var(--signal) 14%, var(--lifted-surface))',
              border: '1px solid var(--border)',
              color: 'var(--signal)',
            }}
          >
            <FaRobot className="text-lg" />
          </span>
          <div>
            <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
              Intelligence Layer
            </p>
            <h2 className="wealth-display text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold">Strategic Advisor</h2>
          </div>
        </div>

        <div
          className="mt-6 card-stadium flex flex-col p-4 md:p-5"
          style={{ minHeight: '62vh', maxHeight: '72vh' }}
        >
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm" style={{ color: 'var(--muted-ink)' }}>
                Building your advisory context...
              </p>
            ) : (
              chatMessages.map((message, index) => (
                <Bubble key={`${message.role}-${index}`} role={message.role} content={message.content} />
              ))
            )}
            {sending && <Bubble role="ai" content="Compiling recommendation..." />}
            <div ref={bottomRef} />
          </div>

          <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="pill-button px-3 py-2 text-xs md:text-sm"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted-ink)' }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="radius-pill flex items-center gap-3 px-3 py-2"
              style={{ border: '1px solid var(--border)', background: 'var(--lifted-surface)' }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Message Strategic Advisor..."
                className="w-full bg-transparent px-2 text-sm outline-none md:text-[0.96rem]"
                style={{ color: 'var(--ink)' }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="radius-circle flex h-10 w-10 items-center justify-center transition-opacity"
                style={{
                  background: 'var(--ink)',
                  color: 'var(--canvas)',
                  opacity: sending || !input.trim() ? 0.45 : 1,
                }}
                aria-label="Send message"
              >
                <FaArrowUpLong />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

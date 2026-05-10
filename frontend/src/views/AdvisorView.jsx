import { useEffect, useMemo, useState } from 'react';
import { FaArrowUpLong, FaRobot, FaUser } from 'react-icons/fa6';
import { apiRequest } from '../services/api.js';

const starterMessage = {
  id: 'ai-starter',
  role: 'ai',
  text: 'Strategic Advisor online. Share your top financial objective for this quarter.',
};

function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span
          className="radius-circle flex h-10 w-10 items-center justify-center"
          style={{
            border: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--orbit) 16%, transparent)',
            color: 'var(--signal)',
          }}
        >
          <FaRobot />
        </span>
      )}

      <div
        className="px-5 py-3 text-sm leading-relaxed"
        style={{
          maxWidth: 'min(75%, 700px)',
          border: `1px solid ${isUser ? 'transparent' : 'var(--border)'}`,
          borderRadius: 'var(--radius-stadium)',
          borderTopLeftRadius: isUser ? 'var(--radius-stadium)' : '0',
          borderTopRightRadius: isUser ? '0' : 'var(--radius-stadium)',
          background: isUser ? 'var(--ink)' : 'var(--lifted-surface)',
          color: isUser ? 'var(--canvas)' : 'var(--ink)',
        }}
      >
        {message.text}
      </div>

      {isUser && (
        <span
          className="radius-circle flex h-10 w-10 items-center justify-center"
          style={{
            border: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--growth) 16%, transparent)',
            color: 'var(--growth)',
          }}
        >
          <FaUser />
        </span>
      )}
    </div>
  );
}

export default function AdvisorView({ accessToken }) {
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        const response = await apiRequest('/ai/history?limit=20', {
          token: accessToken,
        });

        if (!mounted) {
          return;
        }

        const history = [...response.data].reverse();
        if (!history.length) {
          setMessages([starterMessage]);
          return;
        }

        const normalized = history.flatMap((item) => [
          { id: `user-${item.id}`, role: 'user', text: item.message },
          { id: `ai-${item.id}`, role: 'ai', text: item.response },
        ]);
        setMessages([starterMessage, ...normalized]);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err.message || 'Unable to load conversation history.');
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || sending) {
      return;
    }

    setError('');
    const userMessageId = `user-local-${Date.now()}`;
    setMessages((current) => [...current, { id: userMessageId, role: 'user', text: prompt }]);
    setInput('');

    try {
      setSending(true);
      const response = await apiRequest('/ai/advice', {
        method: 'POST',
        token: accessToken,
        body: { message: prompt },
      });

      setMessages((current) => [
        ...current,
        {
          id: `ai-local-${Date.now()}`,
          role: 'ai',
          text: response.data.response,
        },
      ]);
    } catch (err) {
      setError(err.message || 'Unable to fetch AI advice right now.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="card-stadium px-5 py-5 md:px-7 md:py-7">
      <header className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <span
          className="radius-circle flex h-12 w-12 items-center justify-center"
          style={{
            border: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--signal) 14%, transparent)',
            color: 'var(--signal)',
          }}
        >
          <FaRobot className="text-lg" />
        </span>
        <div>
          <p className="eyebrow" style={{ color: 'var(--muted-ink)' }}>
            Intelligence Terminal
          </p>
          <h2 className="wealth-display mt-1 text-[2.25rem] font-extrabold">Strategic Advisor</h2>
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-5">
        {error ? (
          <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>
            {error}
          </p>
        ) : null}

        <div className="max-h-[53vh] min-h-[40vh] space-y-4 overflow-y-auto pr-1">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="radius-pill flex items-center gap-3 px-3 py-2"
          style={{ border: '1px solid var(--border)', background: 'var(--lifted-surface)' }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Strategic Advisor about savings, risk, or allocation..."
            className="w-full bg-transparent px-2 text-sm outline-none"
            style={{ color: 'var(--ink)' }}
          />
          <button
            type="submit"
            disabled={!canSend || sending}
            className="radius-circle flex h-10 w-10 items-center justify-center"
            style={{
              background: 'var(--ink)',
              color: 'var(--canvas)',
              opacity: canSend && !sending ? 1 : 0.45,
            }}
            aria-label="Send message"
          >
            <FaArrowUpLong />
          </button>
        </form>
      </div>
    </section>
  );
}

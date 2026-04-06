import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { getAdvice, getHistory } from '../services/aiService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const SUGGESTED = [
  'How can I improve my savings rate?',
  'Am I spending too much on food?',
  'What investment options suit my profile?',
  'How do I build an emergency fund?',
  'Analyze my financial habits this month',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-600' : 'bg-indigo-500/10 border border-base'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
      </div>
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-indigo-600 text-white rounded-tr-sm' : 'rounded-tl-sm border border-base'}`}
        style={!isUser ? { backgroundColor: 'var(--elevated)', color: 'var(--text)' } : {}}>
        {msg.content.split('\n').map((line, i) => {
          const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          return <p key={i} dangerouslySetInnerHTML={{ __html: bold }} className={i > 0 ? 'mt-1' : ''} />;
        })}
      </div>
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
    getHistory()
      .then((res) => {
        const history = res.data.data || [];
        const flat = history.flatMap((c) => [
          { role: 'user', content: c.user_message },
          { role: 'ai', content: c.ai_response },
        ]);
        setMessages(flat);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: msg }]);
    setSending(true);
    try {
      const res = await getAdvice(msg);
      setMessages((m) => [...m, { role: 'ai', content: res.data.data.response }]);
    } catch {
      toast.error('Failed to get AI response');
      setMessages((m) => [...m, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-xl font-semibold text-main flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" /> AI Financial Advisor
        </h1>
        <p className="text-sub text-sm mt-0.5">Powered by Gemini AI — ask anything about your finances</p>
      </div>

      <Card className="flex-1 flex flex-col" style={{ minHeight: '500px' }}>
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: '520px', minHeight: '380px' }}>
          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="w-14 h-14 bg-indigo-500/10 border border-base rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-main font-semibold mb-1">Start a Conversation</h3>
              <p className="text-muted text-sm max-w-xs">Ask your AI advisor anything about your finances — savings, investments, spending habits, and more.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="px-3 py-1.5 text-xs bg-elevated hover:bg-hover border border-base rounded-full text-sub hover:text-main transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
              {sending && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-base flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="border border-base px-4 py-3 rounded-2xl rounded-tl-sm" style={{ backgroundColor: 'var(--elevated)' }}>
                    <div className="flex gap-1.5 items-center h-4">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Suggestions if history exists */}
        {messages.length > 0 && !sending && (
          <div className="px-5 pb-2 flex gap-2 overflow-x-auto">
            {SUGGESTED.slice(0, 3).map((s) => (
              <button key={s} onClick={() => send(s)}
                className="px-3 py-1.5 text-xs bg-elevated hover:bg-hover border border-base rounded-full text-sub hover:text-main transition-colors whitespace-nowrap flex-shrink-0">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-base">
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              disabled={sending}
              className="field rounded-xl flex-1"
            />
            <button type="submit" disabled={!input.trim() || sending}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

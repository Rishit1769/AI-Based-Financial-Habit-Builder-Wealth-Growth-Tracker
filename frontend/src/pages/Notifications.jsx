import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react';
import { getAll, markRead, markAllRead, deleteOne, clearRead } from '../services/notificationService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDate } from '../utils/constants';
import toast from 'react-hot-toast';

const TYPE_STYLES = {
  habit_reminder:   { color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20', label: 'Habit' },
  report_ready:     { color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', label: 'Report' },
  goal_achieved:    { color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', label: 'Goal' },
  streak_milestone: { color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20', label: 'Streak' },
  system:           { color: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20', label: 'System' },
  welcome:          { color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', label: 'Welcome' },
};

function typeStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.system;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread

  const load = async () => {
    try {
      const res = await getAll();
      setNotifications(res.data.data);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  const handleDeleteOne = async (id) => {
    try {
      await deleteOne(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { toast.error('Failed to delete notification'); }
  };

  const handleClearRead = async () => {
    if (!confirm('Clear all read notifications?')) return;
    try {
      await clearRead();
      setNotifications(prev => prev.filter(n => !n.is_read));
      toast.success('Read notifications cleared');
    } catch { toast.error('Failed to clear notifications'); }
  };

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-ink)] flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Notifications
          </h1>
          <p className="text-sub text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => n.is_read) && (
            <Button variant="secondary" size="sm" onClick={handleClearRead}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear read
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-elevated   p-1 w-fit">
        {['all', 'unread'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5   text-sm font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-indigo-600 text-white'
                : 'text-sub hover:text-[var(--color-ink)]'
            }`}
          >
            {tab}
            {tab === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-indigo-500/30 text-indigo-300 text-xs px-1.5  ">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <Card>
        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--color-muted)]">
            <BellOff className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No notifications</p>
            <p className="text-sm mt-1">
              {filter === 'unread' ? 'All caught up!' : 'Notifications will appear here.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {displayed.map(n => {
              const ts = typeStyle(n.type);
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                    n.is_read ? 'opacity-50' : 'bg-[var(--accent-dim)]'
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div className={`w-2.5 h-2.5   transition-colors ${n.is_read ? 'bg-transparent' : 'bg-indigo-500'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs px-2 py-0.5   font-medium ${ts.color}`}>
                        {ts.label}
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">{formatDate(n.created_at)}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--color-ink)] leading-snug">{n.title}</p>
                    {n.body && <p className="text-sm text-sub mt-0.5">{n.body}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[var(--color-muted)] hover:text-indigo-400 transition-colors p-1"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOne(n.id)}
                      className="text-[var(--color-muted)] hover:text-[var(--color-terracotta)] transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

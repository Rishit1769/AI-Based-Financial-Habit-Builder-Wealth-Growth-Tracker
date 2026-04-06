import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import 'package:intl/intl.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = true;
  String _filter = 'all'; // all | unread

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await api.get('/notifications');
      setState(() {
        _notifications = List<Map<String, dynamic>>.from(res['data']);
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to load notifications')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _markRead(String id) async {
    try {
      await api.put('/notifications/$id/read');
      setState(() {
        final idx = _notifications.indexWhere((n) => n['id'] == id);
        if (idx != -1) _notifications[idx] = {..._notifications[idx], 'is_read': true};
      });
    } catch (_) {}
  }

  Future<void> _markAllRead() async {
    try {
      await api.put('/notifications/read-all');
      setState(() {
        _notifications = _notifications.map((n) => {...n, 'is_read': true}).toList();
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('All notifications marked as read')),
        );
      }
    } catch (_) {}
  }

  Color _typeColor(String? type) {
    switch (type) {
      case 'habit_reminder': return AppTheme.primary;
      case 'report_ready':   return AppTheme.income;
      case 'goal_achieved':  return Colors.amber;
      case 'streak_milestone': return Colors.purple;
      case 'welcome':        return Colors.blue;
      default:               return AppTheme.textSecondary;
    }
  }

  String _typeLabel(String? type) {
    switch (type) {
      case 'habit_reminder': return 'Habit';
      case 'report_ready':   return 'Report';
      case 'goal_achieved':  return 'Goal';
      case 'streak_milestone': return 'Streak';
      case 'welcome':        return 'Welcome';
      default:               return 'System';
    }
  }

  String _formatDate(String? raw) {
    if (raw == null) return '';
    try {
      return DateFormat('d MMM y').format(DateTime.parse(raw).toLocal());
    } catch (_) {
      return raw;
    }
  }

  @override
  Widget build(BuildContext context) {
    final displayed = _filter == 'unread'
        ? _notifications.where((n) => n['is_read'] != true).toList()
        : _notifications;
    final unreadCount = _notifications.where((n) => n['is_read'] != true).length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        title: const Text('Notifications', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: AppTheme.textPrimary),
        actions: [
          if (unreadCount > 0)
            TextButton.icon(
              onPressed: _markAllRead,
              icon: const Icon(Icons.done_all_rounded, size: 18, color: AppTheme.primary),
              label: const Text('Mark all read', style: TextStyle(color: AppTheme.primary, fontSize: 13)),
            ),
        ],
      ),
      body: Column(
        children: [
          // Filter tabs
          Container(
            color: AppTheme.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: ['all', 'unread'].map((tab) {
                final selected = _filter == tab;
                return GestureDetector(
                  onTap: () => setState(() => _filter = tab),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 7),
                    decoration: BoxDecoration(
                      color: selected ? AppTheme.primary : AppTheme.background,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          tab[0].toUpperCase() + tab.substring(1),
                          style: TextStyle(
                            color: selected ? Colors.white : AppTheme.textSecondary,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                        if (tab == 'unread' && unreadCount > 0) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: selected ? Colors.white24 : AppTheme.primary.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '$unreadCount',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: selected ? Colors.white : AppTheme.primary,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : displayed.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.notifications_off_outlined, size: 56, color: AppTheme.textSecondary.withOpacity(0.3)),
                            const SizedBox(height: 12),
                            Text(
                              _filter == 'unread' ? 'All caught up!' : 'No notifications yet',
                              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _load,
                        color: AppTheme.primary,
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          itemCount: displayed.length,
                          separatorBuilder: (_, __) => const Divider(height: 1, color: AppTheme.border),
                          itemBuilder: (context, i) {
                            final n = displayed[i];
                            final isRead = n['is_read'] == true;
                            final color = _typeColor(n['type']);
                            return Container(
                              color: isRead ? Colors.transparent : AppTheme.surface.withOpacity(0.5),
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                leading: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      width: 10, height: 10,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: isRead ? Colors.transparent : color,
                                      ),
                                    ),
                                  ],
                                ),
                                title: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: color.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: color.withOpacity(0.3)),
                                      ),
                                      child: Text(
                                        _typeLabel(n['type']),
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      _formatDate(n['created_at']),
                                      style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                                    ),
                                  ],
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 4),
                                    Text(
                                      n['title'] ?? '',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: isRead ? FontWeight.normal : FontWeight.w600,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                    if (n['body'] != null && (n['body'] as String).isNotEmpty) ...[
                                      const SizedBox(height: 2),
                                      Text(
                                        n['body'],
                                        style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                                      ),
                                    ],
                                  ],
                                ),
                                trailing: !isRead
                                    ? IconButton(
                                        icon: const Icon(Icons.done_all_rounded, size: 18, color: AppTheme.primary),
                                        onPressed: () => _markRead(n['id']),
                                        tooltip: 'Mark as read',
                                      )
                                    : null,
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

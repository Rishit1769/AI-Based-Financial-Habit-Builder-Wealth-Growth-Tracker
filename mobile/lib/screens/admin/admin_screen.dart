import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _api = ApiService();

  // Overview
  Map<String, dynamic>? _stats;
  bool _statsLoading = true;

  // Activity
  List<Map<String, dynamic>> _activity = [];
  bool _activityLoading = true;

  // Users
  List<Map<String, dynamic>> _users = [];
  bool _usersLoading = true;
  int _userPage = 1;
  int _userTotal = 0;
  final _searchCtrl = TextEditingController();

  // Feedback
  List<Map<String, dynamic>> _feedback = [];
  bool _feedbackLoading = false;
  int _fbPage = 1;
  int _fbTotal = 0;
  String _fbStatus = 'all';
  String? _expandedFbId;

  static const _perPage = 20;
  static const _tabs = ['Overview', 'Users', 'Activity', 'Feedback'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this)
      ..addListener(() {
        if (!_tabController.indexIsChanging) {
          if (_tabController.index == 3 && _feedback.isEmpty) {
            _loadFeedback();
          }
        }
      });
    _loadStats();
    _loadActivity();
    _loadUsers();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  // ── Data loaders ────────────────────────────────────────────
  Future<void> _loadStats() async {
    setState(() => _statsLoading = true);
    try {
      final res = await _api.get('/admin/stats');
      setState(() => _stats = res['data']);
    } catch (_) {}
    setState(() => _statsLoading = false);
  }

  Future<void> _loadActivity() async {
    setState(() => _activityLoading = true);
    try {
      final res = await _api.get('/admin/activity');
      final raw = res['data'] as Map<String, dynamic>;
      final userRows = (raw['users'] as List).cast<Map<String, dynamic>>();
      final incRows = (raw['income'] as List).cast<Map<String, dynamic>>();
      final expRows = (raw['expenses'] as List).cast<Map<String, dynamic>>();
      final months = <String>{
        ...userRows.map((r) => r['month'] as String),
        ...incRows.map((r) => r['month'] as String),
        ...expRows.map((r) => r['month'] as String),
      }.toList();
      setState(() {
        _activity = months.map((m) => {
          'month': m,
          'new_users': double.parse(
              (userRows.firstWhere((r) => r['month'] == m, orElse: () => {'total': '0'})['total'] ?? '0').toString()),
          'income': double.parse(
              (incRows.firstWhere((r) => r['month'] == m, orElse: () => {'total': '0'})['total'] ?? '0').toString()),
          'expenses': double.parse(
              (expRows.firstWhere((r) => r['month'] == m, orElse: () => {'total': '0'})['total'] ?? '0').toString()),
        }).toList();
      });
    } catch (_) {}
    setState(() => _activityLoading = false);
  }

  Future<void> _loadUsers({String? q, int page = 1}) async {
    setState(() => _usersLoading = true);
    try {
      final res = await _api.get('/admin/users', params: {
        if (q != null && q.isNotEmpty) 'search': q,
        'page': page,
        'limit': _perPage,
      });
      setState(() {
        _users = (res['data'] as List).cast<Map<String, dynamic>>();
        _userTotal = (res['pagination']?['total'] ?? 0) as int;
        _userPage = page;
      });
    } catch (_) {}
    setState(() => _usersLoading = false);
  }

  Future<void> _loadFeedback({String? status, int page = 1}) async {
    final s = status ?? _fbStatus;
    setState(() => _feedbackLoading = true);
    try {
      final res = await _api.get('/admin/feedback', params: {
        if (s != 'all') 'status': s,
        'page': page,
        'limit': _perPage,
      });
      setState(() {
        _feedback = (res['data'] as List).cast<Map<String, dynamic>>();
        _fbTotal = (res['pagination']?['total'] ?? 0) as int;
        _fbStatus = s;
        _fbPage = page;
      });
    } catch (_) {}
    setState(() => _feedbackLoading = false);
  }

  Future<void> _toggleUser(Map<String, dynamic> u) async {
    try {
      await _api.put('/admin/users/${u['id']}/toggle');
      _showSnack('${u['name']} ${u['is_active'] == true ? 'deactivated' : 'activated'}');
      _loadUsers(q: _searchCtrl.text, page: _userPage);
    } catch (_) {
      _showSnack('Failed to update user', error: true);
    }
  }

  Future<void> _deleteUser(Map<String, dynamic> u) async {
    final confirmed = await _confirm('Delete user "${u['name']}"? This cannot be undone.');
    if (!confirmed) return;
    try {
      await _api.delete('/admin/users/${u['id']}');
      _showSnack('User deleted');
      _loadUsers(q: _searchCtrl.text, page: _userPage);
    } catch (_) {
      _showSnack('Failed to delete user', error: true);
    }
  }

  Future<void> _updateFbStatus(String id, String status) async {
    try {
      await _api.put('/admin/feedback/$id/status', data: {'status': status});
      _showSnack('Status updated');
      setState(() => _expandedFbId = null);
      _loadFeedback(page: _fbPage);
    } catch (_) {
      _showSnack('Failed', error: true);
    }
  }

  Future<void> _deleteFeedback(String id) async {
    final confirmed = await _confirm('Delete this feedback?');
    if (!confirmed) return;
    try {
      await _api.delete('/admin/feedback/$id');
      _showSnack('Deleted');
      _loadFeedback(page: _fbPage);
    } catch (_) {
      _showSnack('Failed', error: true);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────
  void _showSnack(String msg, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: error ? AppTheme.error : AppTheme.success,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
    ));
  }

  Future<bool> _confirm(String msg) async {
    return await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            backgroundColor: AppTheme.surface,
            title: const Text('Confirm', style: TextStyle(color: AppTheme.textPrimary)),
            content: Text(msg, style: const TextStyle(color: AppTheme.textSecondary)),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Confirm', style: TextStyle(color: AppTheme.error)),
              ),
            ],
          ),
        ) ??
        false;
  }

  String _fmt(double v) => '₹${v >= 100000 ? '${(v / 100000).toStringAsFixed(1)}L' : v >= 1000 ? '${(v / 1000).toStringAsFixed(1)}K' : v.toStringAsFixed(0)}';

  // ── Build ────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (!auth.isAdmin) {
      return const Scaffold(
        backgroundColor: AppTheme.background,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.lock_outline_rounded, size: 48, color: AppTheme.textMuted),
              SizedBox(height: 12),
              Text('Admin access only', style: TextStyle(color: AppTheme.textSecondary, fontSize: 16)),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surface,
        elevation: 0, title: Row(
          children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                color: AppTheme.warning.withOpacity(0.15),
                borderRadius: BorderRadius.zero,
              ),
              child: const Icon(Icons.shield_outlined, size: 18, color: AppTheme.warning),
            ),
            const SizedBox(width: 10),
            const Text('Admin Dashboard', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          indicatorColor: AppTheme.primary,
          indicatorWeight: 2,
          labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          tabs: _tabs.map((t) => Tab(text: t)).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverview(),
          _buildUsers(),
          _buildActivity(),
          _buildFeedback(),
        ],
      ),
    );
  }

  // ── OVERVIEW TAB ─────────────────────────────────────────────
  Widget _buildOverview() {
    if (_statsLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    }
    final s = _stats;
    if (s == null) {
      return _emptyState('Failed to load stats', Icons.error_outline_rounded);
    }

    final tiles = [
      _StatTile('Total Users',    '${s['users']?['total'] ?? 0}',       Icons.people_outline_rounded,   AppTheme.primary),
      _StatTile('Active Users',   '${s['users']?['active'] ?? 0}',      Icons.person_outline_rounded,   AppTheme.success),
      _StatTile('New This Month', '${s['users']?['new_this_month'] ?? 0}', Icons.trending_up_rounded, const Color(0xFF3B82F6)),
      _StatTile('Total Reports',  '${s['totalReports'] ?? 0}',          Icons.description_outlined,     const Color(0xFF8B5CF6)),
      _StatTile('Total Income',   _fmt(double.tryParse('${s['totalIncome'] ?? 0}') ?? 0),   Icons.arrow_upward_rounded, AppTheme.success),
      _StatTile('Total Expenses', _fmt(double.tryParse('${s['totalExpenses'] ?? 0}') ?? 0), Icons.arrow_downward_rounded, AppTheme.error),
      _StatTile('Investments',    _fmt(double.tryParse('${s['totalInvestments'] ?? 0}') ?? 0), Icons.pie_chart_outline_rounded, AppTheme.warning),
      _StatTile('Savings Saved',  _fmt(double.tryParse('${s['savingsGoals']?['saved'] ?? 0}') ?? 0), Icons.savings_outlined, const Color(0xFF06B6D4)),
      _StatTile('Active Habits',  '${s['totalHabits'] ?? 0}',           Icons.repeat_rounded,           const Color(0xFFA855F7)),
      _StatTile('Savings Goals',  '${s['savingsGoals']?['total'] ?? 0}', Icons.flag_outlined,           const Color(0xFFEC4899)),
    ];

    return RefreshIndicator(
      color: AppTheme.primary,
      backgroundColor: AppTheme.surface,
      onRefresh: _loadStats,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.6,
            ),
            itemCount: tiles.length,
            itemBuilder: (_, i) => _buildStatTile(tiles[i]),
          ),
        ],
      ),
    );
  }

  Widget _buildStatTile(_StatTile t) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.zero,
        border: Border.all(color: AppTheme.border),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(
              color: t.color.withOpacity(0.12),
              borderRadius: BorderRadius.zero,
            ),
            child: Icon(t.icon, size: 16, color: t.color),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(t.value, style: TextStyle(color: t.color, fontSize: 18, fontWeight: FontWeight.w700)),
              Text(t.label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  // ── USERS TAB ───────────────────────────────────────────────
  Widget _buildUsers() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchCtrl,
                  style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Search by name or email...',
                    hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
                    prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.textMuted, size: 18),
                    filled: true,
                    fillColor: AppTheme.surface,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: AppTheme.border)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide(color: AppTheme.border)),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: const BorderSide(color: AppTheme.primary)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: () { _userPage = 1; _loadUsers(q: _searchCtrl.text); },
                style: TextButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: const Color(0xFFF5F2EB),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                ),
                child: const Text('Search', style: TextStyle(fontSize: 13)),
              ),
            ],
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            color: AppTheme.primary,
            backgroundColor: AppTheme.surface,
            onRefresh: () => _loadUsers(q: _searchCtrl.text, page: _userPage),
            child: _usersLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : _users.isEmpty
                    ? _emptyState('No users found', Icons.person_search_rounded)
                    : ListView(
                        padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                        children: [
                          ..._users.map((u) => _buildUserTile(u)),
                          if (_userTotal > _perPage) _buildPagination(
                            current: _userPage, total: _userTotal,
                            onPrev: () => _loadUsers(q: _searchCtrl.text, page: _userPage - 1),
                            onNext: () => _loadUsers(q: _searchCtrl.text, page: _userPage + 1),
                          ),
                        ],
                      ),
          ),
        ),
      ],
    );
  }

  Widget _buildUserTile(Map<String, dynamic> u) {
    final isAdmin = u['role'] == 'admin';
    final isActive = u['is_active'] == true;
    final initials = (u['name'] as String? ?? '?')
        .split(' ')
        .where((w) => w.isNotEmpty)
        .map((w) => w[0].toUpperCase())
        .take(2)
        .join();

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.zero,
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 38, height: 38,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.zero,
            ),
            child: Center(child: Text(initials, style: const TextStyle(color: const Color(0xFFF5F2EB), fontSize: 12, fontWeight: FontWeight.w700))),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(child: Text(u['name'] ?? '', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
                    const SizedBox(width: 6),
                    if (isAdmin) _chip('Admin', AppTheme.warning),
                    if (!isActive) _chip('Inactive', AppTheme.error),
                  ],
                ),
                const SizedBox(height: 2),
                Text(u['email'] ?? '', style: const TextStyle(color: AppTheme.textMuted, fontSize: 11), overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          if (!isAdmin) ...[
            const SizedBox(width: 8),
            Column(
              children: [
                GestureDetector(
                  onTap: () => _toggleUser(u),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isActive ? AppTheme.elevated : AppTheme.success.withOpacity(0.12),
                      borderRadius: BorderRadius.zero,
                    ),
                    child: Text(
                      isActive ? 'Deactivate' : 'Activate',
                      style: TextStyle(color: isActive ? AppTheme.textMuted : AppTheme.success, fontSize: 10, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                GestureDetector(
                  onTap: () => _deleteUser(u),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppTheme.error.withOpacity(0.1),
                      borderRadius: BorderRadius.zero,
                    ),
                    child: const Icon(Icons.delete_outline_rounded, size: 14, color: AppTheme.error),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // ── ACTIVITY TAB ─────────────────────────────────────────────
  Widget _buildActivity() {
    if (_activityLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    }
    if (_activity.isEmpty) {
      return _emptyState('No activity data', Icons.bar_chart_rounded);
    }

    return RefreshIndicator(
      color: AppTheme.primary,
      backgroundColor: AppTheme.surface,
      onRefresh: _loadActivity,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _sectionCard(
            title: 'Monthly New Users',
            child: SizedBox(
              height: 200,
              child: BarChart(BarChartData(
                alignment: BarChartAlignment.spaceAround,
                barGroups: _activity.asMap().entries.map((e) => BarChartGroupData(
                  x: e.key,
                  barRods: [BarChartRodData(
                    toY: (e.value['new_users'] as num).toDouble(),
                    color: AppTheme.primary,
                    width: 16,
                    borderRadius: BorderRadius.zero,
                  )],
                )).toList(),
                titlesData: FlTitlesData(
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (v, m) {
                        final i = v.toInt();
                        if (i < 0 || i >= _activity.length) return const SizedBox();
                        final parts = (_activity[i]['month'] as String).split(' ');
                        return Text(parts[0], style: const TextStyle(color: AppTheme.textMuted, fontSize: 10));
                      },
                    ),
                  ),
                ),
                gridData: FlGridData(
                  show: true,
                  getDrawingHorizontalLine: (_) => FlLine(color: AppTheme.border, strokeWidth: 1),
                  drawVerticalLine: false,
                ),
                borderData: FlBorderData(show: false),
              )),
            ),
          ),
          const SizedBox(height: 16),
          _sectionCard(
            title: 'Income vs Expenses',
            child: SizedBox(
              height: 200,
              child: BarChart(BarChartData(
                alignment: BarChartAlignment.spaceAround,
                barGroups: _activity.asMap().entries.map((e) => BarChartGroupData(
                  x: e.key,
                  barsSpace: 4,
                  barRods: [
                    BarChartRodData(toY: (e.value['income'] as num).toDouble(), color: AppTheme.success, width: 10, borderRadius: BorderRadius.zero),
                    BarChartRodData(toY: (e.value['expenses'] as num).toDouble(), color: AppTheme.error, width: 10, borderRadius: BorderRadius.zero),
                  ],
                )).toList(),
                titlesData: FlTitlesData(
                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (v, m) {
                        final i = v.toInt();
                        if (i < 0 || i >= _activity.length) return const SizedBox();
                        final parts = (_activity[i]['month'] as String).split(' ');
                        return Text(parts[0], style: const TextStyle(color: AppTheme.textMuted, fontSize: 10));
                      },
                    ),
                  ),
                ),
                gridData: FlGridData(
                  show: true,
                  getDrawingHorizontalLine: (_) => FlLine(color: AppTheme.border, strokeWidth: 1),
                  drawVerticalLine: false,
                ),
                borderData: FlBorderData(show: false),
              )),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _legendDot(AppTheme.success, 'Income'),
              const SizedBox(width: 16),
              _legendDot(AppTheme.error, 'Expenses'),
              const SizedBox(width: 16),
              _legendDot(AppTheme.primary, 'New Users'),
            ],
          ),
        ],
      ),
    );
  }

  // ── FEEDBACK TAB ─────────────────────────────────────────────
  Widget _buildFeedback() {
    return Column(
      children: [
        // Status filter chips
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['all', 'open', 'in_review', 'resolved', 'closed'].map((s) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () { _fbPage = 1; _loadFeedback(status: s); },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: _fbStatus == s ? AppTheme.primary : AppTheme.surface,
                      borderRadius: BorderRadius.zero,
                      border: Border.all(color: _fbStatus == s ? AppTheme.primary : AppTheme.border),
                    ),
                    child: Text(
                      s == 'in_review' ? 'In Review' : s[0].toUpperCase() + s.substring(1),
                      style: TextStyle(
                        color: _fbStatus == s ? const Color(0xFFF5F2EB) : AppTheme.textMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              )).toList(),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: RefreshIndicator(
            color: AppTheme.primary,
            backgroundColor: AppTheme.surface,
            onRefresh: () => _loadFeedback(page: _fbPage),
            child: _feedbackLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : _feedback.isEmpty
                    ? _emptyState('No feedback items', Icons.inbox_outlined)
                    : ListView(
                        padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
                        children: [
                          ..._feedback.map((f) => _buildFeedbackTile(f)),
                          if (_fbTotal > _perPage) _buildPagination(
                            current: _fbPage, total: _fbTotal,
                            onPrev: () => _loadFeedback(page: _fbPage - 1),
                            onNext: () => _loadFeedback(page: _fbPage + 1),
                          ),
                        ],
                      ),
          ),
        ),
      ],
    );
  }

  Widget _buildFeedbackTile(Map<String, dynamic> f) {
    final isExpanded = _expandedFbId == f['id'];
    final status = f['status'] as String? ?? 'open';
    final type = f['type'] as String? ?? 'feedback';

    final statusColor = {
      'open': AppTheme.warning, 'in_review': AppTheme.primary,
      'resolved': AppTheme.success, 'closed': AppTheme.textMuted,
    }[status] ?? AppTheme.textMuted;

    final typeColor = {
      'bug': AppTheme.error, 'feature': const Color(0xFF3B82F6),
      'complaint': AppTheme.warning, 'feedback': const Color(0xFFA855F7),
    }[type] ?? AppTheme.textMuted;

    return GestureDetector(
      onTap: () => setState(() => _expandedFbId = isExpanded ? null : f['id'] as String),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.zero,
          border: Border.all(color: isExpanded ? AppTheme.primary.withOpacity(0.4) : AppTheme.border),
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            _chip(type[0].toUpperCase() + type.substring(1), typeColor),
                            const SizedBox(width: 6),
                            _chip(status == 'in_review' ? 'In Review' : status[0].toUpperCase() + status.substring(1), statusColor),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(f['subject'] ?? '', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 2),
                        Text('${f['user_name'] ?? 'Unknown'} · ${f['user_email'] ?? ''}', style: const TextStyle(color: AppTheme.textMuted, fontSize: 11), overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _deleteFeedback(f['id'] as String),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(color: AppTheme.error.withOpacity(0.1), borderRadius: BorderRadius.zero),
                      child: const Icon(Icons.delete_outline_rounded, size: 14, color: AppTheme.error),
                    ),
                  ),
                ],
              ),
            ),
            if (isExpanded) ...[
              Container(height: 1, color: AppTheme.border),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(f['message'] ?? '', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.5)),
                    if (f['admin_notes'] != null) ...[
                      const SizedBox(height: 10),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: AppTheme.elevated, borderRadius: BorderRadius.zero),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Admin Notes', style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text(f['admin_notes'], style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8, runSpacing: 8,
                      children: ['open', 'in_review', 'resolved', 'closed'].map((s) => GestureDetector(
                        onTap: status == s ? null : () => _updateFbStatus(f['id'] as String, s),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: status == s ? AppTheme.primary.withOpacity(0.2) : AppTheme.elevated,
                            borderRadius: BorderRadius.zero,
                            border: Border.all(color: status == s ? AppTheme.primary.withOpacity(0.5) : Colors.transparent),
                          ),
                          child: Text(
                            s == 'in_review' ? 'In Review' : s[0].toUpperCase() + s.substring(1),
                            style: TextStyle(
                              color: status == s ? AppTheme.primary : AppTheme.textMuted,
                              fontSize: 11, fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      )).toList(),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ── Shared widgets ───────────────────────────────────────────
  Widget _sectionCard({required String title, required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.zero,
        border: Border.all(color: AppTheme.border),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildPagination({required int current, required int total, required VoidCallback onPrev, required VoidCallback onNext}) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('${(current - 1) * _perPage + 1}–${(current * _perPage).clamp(0, total)} of $total', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          Row(
            children: [
              TextButton(
                onPressed: current > 1 ? onPrev : null,
                style: TextButton.styleFrom(backgroundColor: AppTheme.surface, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6)),
                child: const Text('Prev', style: TextStyle(fontSize: 12)),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: current * _perPage < total ? onNext : null,
                style: TextButton.styleFrom(backgroundColor: AppTheme.surface, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6)),
                child: const Text('Next', style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _emptyState(String msg, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: AppTheme.textMuted),
          const SizedBox(height: 12),
          Text(msg, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 14)),
        ],
      ),
    );
  }

  Widget _chip(String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
    decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.zero),
    child: Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600)),
  );

  Widget _legendDot(Color color, String label) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
      const SizedBox(width: 4),
      Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
    ],
  );
}

// Data model for stat tiles
class _StatTile {
  final String label, value;
  final IconData icon;
  final Color color;
  const _StatTile(this.label, this.value, this.icon, this.color);
}

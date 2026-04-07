import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../providers/auth_provider.dart';
import '../../providers/dashboard_provider.dart';
import '../../config/theme.dart';
import '../../widgets/widgets.dart';

String _fmt(double v) => '₹${v >= 100000 ? '${(v / 100000).toStringAsFixed(1)}L' : v >= 1000 ? '${(v / 1000).toStringAsFixed(1)}K' : v.toStringAsFixed(0)}';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppTheme.primary,
          backgroundColor: AppTheme.surface,
          onRefresh: () => context.read<DashboardProvider>().load(),
          child: Consumer<DashboardProvider>(
            builder: (context, dash, _) {
              if (dash.loading) {
                return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
              }

              final d = dash.data;
              return ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Header
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Good ${_greeting()},', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
                            Text(auth.user?.name.split(' ').first ?? 'User',
                              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
                          ],
                        ),
                      ),
                      Container(
                        width: 42, height: 42,
                        decoration: BoxDecoration(
                          gradient: AppTheme.primaryGradient,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: AppTheme.shadowAccent(AppTheme.primary),
                        ),
                        child: Center(
                          child: Text(
                            auth.user?.name.substring(0, 1).toUpperCase() ?? '?',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  if (d == null) ...[
                    const Center(child: Text('No data', style: TextStyle(color: AppTheme.textSecondary))),
                  ] else ...[
                    // Net worth card
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 20),
                      decoration: BoxDecoration(
                        gradient: AppTheme.primaryGradient,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: AppTheme.shadowAccent(AppTheme.primary),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.account_balance_wallet_rounded, color: Colors.white60, size: 14),
                              const SizedBox(width: 6),
                              const Text('Net Worth', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(_fmt(d.netWorth), style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900, letterSpacing: -1)),
                          const SizedBox(height: 14),
                          Container(height: 1, color: Colors.white.withOpacity(0.15)),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              _MiniStat(label: 'Savings', value: _fmt(d.totalSavings), icon: Icons.savings_rounded),
                              const SizedBox(width: 24),
                              _MiniStat(label: 'Invested', value: _fmt(d.totalInvestments), icon: Icons.show_chart_rounded),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Stats grid
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.5,
                      children: [
                        AppStatCard(title: 'Monthly Income', value: _fmt(d.monthlyIncome), icon: Icons.trending_up_rounded, color: AppTheme.success),
                        AppStatCard(title: 'Monthly Expenses', value: _fmt(d.monthlyExpenses), icon: Icons.trending_down_rounded, color: AppTheme.error),
                        AppStatCard(title: 'Monthly Savings', value: _fmt(d.monthlySavings), icon: Icons.savings_rounded, color: AppTheme.primary),
                        AppStatCard(title: 'Habits Today', value: '${d.completedToday}/${d.totalHabits}', icon: Icons.check_circle_outline, color: Colors.orange),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Net worth trend chart
                    if (d.netWorthTrend.isNotEmpty) ...[
                      AppCard(
                        title: 'Net Worth Trend',
                        padding: const EdgeInsets.fromLTRB(12, 16, 12, 12),
                        child: SizedBox(
                          height: 150,
                          child: LineChart(
                            LineChartData(
                              gridData: FlGridData(
                                drawVerticalLine: false,
                                getDrawingHorizontalLine: (_) => FlLine(color: AppTheme.border, strokeWidth: 1),
                              ),
                              titlesData: FlTitlesData(
                                leftTitles: AxisTitles(
                                  sideTitles: SideTitles(showTitles: true, reservedSize: 48,
                                    getTitlesWidget: (v, _) => Text(_fmt(v), style: const TextStyle(color: AppTheme.textSecondary, fontSize: 9)))),
                                bottomTitles: AxisTitles(
                                  sideTitles: SideTitles(showTitles: true, reservedSize: 18,
                                    getTitlesWidget: (v, _) {
                                      final i = v.toInt();
                                      if (i < 0 || i >= d.netWorthTrend.length) return const SizedBox();
                                      final m = d.netWorthTrend[i]['month']?.toString() ?? '';
                                      return Text(m.length > 3 ? m.substring(0, 3) : m, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 9));
                                    })),
                                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              ),
                              borderData: FlBorderData(show: false),
                              lineBarsData: [
                                LineChartBarData(
                                  spots: d.netWorthTrend.asMap().entries.map((e) {
                                    final v = double.tryParse(e.value['net_worth']?.toString() ?? '0') ?? 0;
                                    return FlSpot(e.key.toDouble(), v);
                                  }).toList(),
                                  isCurved: true,
                                  color: AppTheme.primary,
                                  barWidth: 2.5,
                                  dotData: const FlDotData(show: false),
                                  belowBarData: BarAreaData(
                                    show: true,
                                    color: AppTheme.primary.withOpacity(0.15),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Savings goals
                    if (d.savingsGoals.isNotEmpty) ...[
                      const Padding(
                        padding: EdgeInsets.only(bottom: 8),
                        child: Text('Savings Goals', style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                      ),
                      ...d.savingsGoals.take(3).map((g) {
                        final current = double.tryParse(g['current_amount']?.toString() ?? '0') ?? 0;
                        final target = double.tryParse(g['target_amount']?.toString() ?? '1') ?? 1;
                        return GoalProgressCard(
                          name: g['name'] ?? '',
                          current: current,
                          target: target,
                          progress: (current / target).clamp(0.0, 1.0),
                        );
                      }),
                      const SizedBox(height: 16),
                    ],

                    // Recent transactions
                    if (d.recentTransactions.isNotEmpty) ...[
                      const Padding(
                        padding: EdgeInsets.only(bottom: 8),
                        child: Text('Recent Transactions', style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                      ),
                      ...d.recentTransactions.take(5).map((t) {
                        final isIncome = t['type'] == 'income';
                        final amount = double.tryParse(t['amount']?.toString() ?? '0') ?? 0;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: AppTheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 36, height: 36,
                                decoration: BoxDecoration(
                                  color: isIncome ? AppTheme.success.withOpacity(0.15) : AppTheme.error.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Icon(isIncome ? Icons.trending_up : Icons.trending_down,
                                  color: isIncome ? AppTheme.success : AppTheme.error, size: 18),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(t['description'] ?? t['source'] ?? 'Transaction',
                                      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
                                    Text(t['category'] ?? '', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                                  ],
                                ),
                              ),
                              Text(
                                '${isIncome ? '+' : '-'}₹${amount.toStringAsFixed(0)}',
                                style: TextStyle(
                                  color: isIncome ? AppTheme.success : AppTheme.error,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ],
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _MiniStat({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: Colors.white70, size: 14),
        const SizedBox(width: 4),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Colors.white60, fontSize: 10)),
            Text(value, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      ],
    );
  }
}

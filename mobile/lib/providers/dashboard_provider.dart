import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DashboardData {
  final double monthlyIncome;
  final double monthlyExpenses;
  final double totalSavings;
  final double totalInvestments;
  final int totalHabits;
  final int completedToday;
  final List<Map<String, dynamic>> recentTransactions;
  final List<Map<String, dynamic>> savingsGoals;
  final List<Map<String, dynamic>> netWorthTrend;

  DashboardData({
    required this.monthlyIncome,
    required this.monthlyExpenses,
    required this.totalSavings,
    required this.totalInvestments,
    required this.totalHabits,
    required this.completedToday,
    required this.recentTransactions,
    required this.savingsGoals,
    required this.netWorthTrend,
  });

  double get netWorth => totalSavings + totalInvestments;
  double get monthlySavings => monthlyIncome - monthlyExpenses;
}

class DashboardProvider extends ChangeNotifier {
  DashboardData? _data;
  bool _loading = false;
  String? _error;

  DashboardData? get data => _data;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> load() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await api.get('/dashboard');
      final d = res['data'];
      _data = DashboardData(
        monthlyIncome: double.tryParse(d['monthly_income']?.toString() ?? '0') ?? 0,
        monthlyExpenses: double.tryParse(d['monthly_expenses']?.toString() ?? '0') ?? 0,
        totalSavings: double.tryParse(d['total_savings']?.toString() ?? '0') ?? 0,
        totalInvestments: double.tryParse(d['total_investments']?.toString() ?? '0') ?? 0,
        totalHabits: int.tryParse(d['total_habits']?.toString() ?? '0') ?? 0,
        completedToday: int.tryParse(d['completed_today']?.toString() ?? '0') ?? 0,
        recentTransactions: List<Map<String, dynamic>>.from(d['recent_transactions'] ?? []),
        savingsGoals: List<Map<String, dynamic>>.from(d['savings_goals'] ?? []),
        netWorthTrend: List<Map<String, dynamic>>.from(d['net_worth_trend'] ?? []),
      );
    } catch (e) {
      _error = 'Failed to load dashboard';
    }

    _loading = false;
    notifyListeners();
  }
}
